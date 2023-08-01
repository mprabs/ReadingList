/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import "./App.css";
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useMutation } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:8080/graphql",
  cache: new InMemoryCache(),
});

const SAVE_ARTICLE_MUTATION = gql`
  mutation addArticle($article: ArticleInput!) {
    addArticle(article: $article) {
      title
      content
      imageUrl
      date
      url
    }
  }
`;

function WrapApp() {
  const [websiteData, setWebsiteData] = useState({
    isLoaded: false,
    url: "",
    title: "",
    image: "",
    content: "",
    date: "",
  });

  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    extractContent();
  }, []);

  function extractContent() {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTabId = tabs[0].id;

        setTimeout(() => {
          chrome.tabs.sendMessage(activeTabId, { action: "getContent" }, (response) => {
            if (response && response.content) {
              setWebsiteData({
                isLoaded: true,
                url: response.content.url,
                title: response.content.title,
                image: response.content.image,
                content: response.content.content,
                date: response.content.date,
              });
            }
          });
        }, 1000);
      });
    } catch {
      console.log("error");
    }
  }

  const [addArticle, { loading, error }] = useMutation(SAVE_ARTICLE_MUTATION, {
    onCompleted: () => {
      // Clear input fields after saving
      setWebsiteData({
        url: "",
        title: "",
        image: "",
        content: "",
        date: "",
      });
      setIsComplete(true);
    },
    onError: (error) => {
      console.error("Error saving article:", error);
    },
  });

  const handleAddArticle = () => {
    // Prepare the variables
    const variables = {
      article: {
        url: websiteData.url,
        title: websiteData.title,
        content: websiteData.content,
        imageUrl: websiteData.image,
        date: websiteData.date,
      },
    };

    console.log({ variables });

    // Call the mutation function to save the article
    addArticle({ variables });
  };

  return (
    <div className="App">
      {loading ? (
        "Saving data..."
      ) : error ? (
        <p>{error.message}</p>
      ) : isComplete ? (
        "Successully Saved!"
      ) : websiteData.isLoaded ? (
        <>
          <h1>Article Data</h1>
          <hr />
          <DataItem title="URL" data={websiteData.url} />
          <DataItem title="Title" data={websiteData.title} />
          <DataItem title="Image" data={websiteData.image} isImage />
          <DataItem title="Content" data={websiteData.content} />
          <DataItem title="Date" data={websiteData.date} />
          <button onClick={handleAddArticle}>Save Article</button>
        </>
      ) : (
        <p>Extracting Article Data...</p>
      )}
    </div>
  );
}

const DataItem = ({ title, data, isImage }) => {
  return (
    <div className="data-item">
      <span>{title}</span>

      {isImage ? <img src={data} alt="" /> : <p>{data}</p>}
    </div>
  );
};

const App = () => {
  return (
    <ApolloProvider client={client}>
      <WrapApp />
    </ApolloProvider>
  );
};

export default App;
