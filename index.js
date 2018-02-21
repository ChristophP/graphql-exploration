const express = require("express");
const graphqlHTTP = require("express-graphql");
const { makeExecutableSchema } = require("graphql-tools");
const DataLoader = require("dataloader");
const R = require("ramda");
const client = require("./fake-client");

// Construct a schema, using GraphQL schema language
const typeDefs = `
  type Author {
    id: Int!
    firstName: String
    lastName: String
    fullName: String
    """
    the list of Posts by this author
    """
    posts: [Post]
  }

  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }

  # the schema allows the following query:
  type Query {
    allPosts: [Post]
    fetchSomePosts(ids: [Int!]!): [Post]
    allAuthors: [Author]
  }

  # this schema allows the following mutation:
  type Mutation {
    upvotePost (
      postId: Int!
    ): Post
  }
`;

const resolvers = {
  Query: {
    allPosts: client.posts.findAll,
    allAuthors: client.authors.findAll,
    fetchSomePosts: (_, { ids }) => client.posts.findAll(ids),
  },
  Mutation: {
    upvotePost: (_, { postId }) => {
      const post = R.find(R.propEq("id", postId), posts);
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }
      post.votes += 1;
      return post;
    },
  },
  Author: {
    // will be batched by data loader instead of n+1 query
    posts: (author, _, { postsLoader }) =>
      console.log("resolve") || postsLoader.load(author.id),
    fullName: author => {
      return `${author.firstName} ${author.lastName}`;
    },
  },
  Post: {
    author: post => R.filter(R.propEq("id", post.authorId), authors),
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
app.use(
  "/graphql",
  graphqlHTTP(() => ({
    schema: schema,
    graphiql: true,
    context: {
      postsLoader: new DataLoader(client.posts.findAllByAuthor),
    },
  }))
);
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
