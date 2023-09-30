const express = require("express");
const _ = require("lodash");
const axios = require("axios");

const app = express();

app.get("/api/blog-stats", async (req, res) => {
  try {
    const blogs = await fetchData();

    const analysis = analysisData(blogs);

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal Server Error" });
  }
});

app.get("/api/blog-search/", async (req, res) => {
  try {
    const query = req.query.query.toLowerCase();
    const searchResults = await queriedSearch(query);

    res.json({ success: true, blogs: searchResults });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal Server Error" });
  }
});

async function fetchData() {
  try {
    const response = await axios.get(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      {
        headers: {
          "x-hasura-admin-secret":
            "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
        },
      }
    );

    return response.data.blogs;
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal Server Error" });
  }
}
const analysisData = _.memoize(
  (blogs) => {
    let totalBlogs = blogs.length;
    let longestBlog = _.maxBy(blogs, "title.length");
    let blogsWithPrivacy = blogs.filter((blog) =>
      blog.title.toLowerCase().includes("privacy")
    );
    let uniqueTitle = _.uniqBy(blogs, "title").map((blog) => blog.title);

    return {
      totalBlogs,
      longestBlogTitle: longestBlog.title,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueTitle,
    };
  },
  undefined,
  300000
);

const queriedSearch = _.memoize(
  async (query) => {
    const blogs = await fetchData();
    const searchResults = blogs.filter((blog) =>
      blog.title.toLowerCase().includes(query)
    );
    return searchResults;
  },
  (query) => query.toLowerCase(),
  300000
);

app.listen(3000, () => {
  console.log("Server running on port 3000...");
});
