import mondayInstance from "../../mondayInstance.js";

const createBoardForUser = async (user) => {
  try {
    // Replace "Board Name" with the desired name for the user's board
    const boardName = "Reading List";

    // Make the API call to create a new board on Monday.com
    const response = await mondayInstance.api(
      `mutation {
          create_board(
            board_name: "${boardName}",
            board_kind: public,
            board_visibility: "everyone"
          ) {
            id
          }
        }`
    );

    return response.data.create_board;
  } catch (error) {
    console.error("Error creating board on Monday.com:", error);
    throw new Error("Failed to create board");
  }
};

const updateBoardWithArticle = async (user, article) => {
  try {
    const columns = JSON.stringify({
      [user.columns.imageUrl]: article.imageUrl,
      [user.columns.date]: new Date(article.date).toLocaleDateString(),
      [user.columns.link]: article.url,
      // [user.columns.content]: article.content,
    });

    console.log({ columns, date: article.date });

    await mondayInstance.setToken(user.accessToken);

    const createData = {
      query: `
      mutation ($boardId: Int!, $itemName: String!, $columnValue: JSON) {
        create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValue) {
          id
        }
      }
    `,
      options: {
        variables: {
          boardId: Number(user.board_id),
          itemName: article.title,
          columnValue: columns,
        },
      },
    };

    mondayInstance.api(createData.query, createData.options).then((res) => {
      const {
        create_item: { id },
      } = res.data;

      const updateData = {
        query: `
        mutation($item_id: Int!, $body: String!) {
          create_update (item_id: $item_id, body: $body) {
            id
          }
        }
        `,
        options: {
          variables: {
            item_id: Number(id),
            body: article.content,
          },
        },
      };

      mondayInstance.api(updateData.query, updateData.options).then((res) => {
        console.log("update added", res);
      });
    });
  } catch (error) {
    console.error("Error updating board with article on Monday.com:", error);
    throw new Error("Failed to update board with article");
  }
};

module.exports = {
  createBoardForUser,
  updateBoardWithArticle,
};
