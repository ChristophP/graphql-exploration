const R = require("ramda");

// example data
const authors = [
  { id: 1, firstName: "Tom", lastName: "Coleman" },
  { id: 2, firstName: "Sashko", lastName: "Stubailo" },
  { id: 3, firstName: "Mikhail", lastName: "Novikov" },
];
const posts = [
  { id: 1, authorId: 1, title: "Introduction to GraphQL", votes: 2 },
  { id: 2, authorId: 2, title: "Welcome to Meteor", votes: 3 },
  { id: 3, authorId: 2, title: "Advanced GraphQL", votes: 1 },
  { id: 4, authorId: 3, title: "Launchpad is Cool", votes: 7 },
];

module.exports = {
  posts: {
    find: id => Promise.resolve(R.filter(R.propEq("id", id), posts)),
    findAll: (filter = []) => {
      const result =
        filter.length > 0
          ? R.filter(entry => R.contains(entry.id, filter), posts)
          : posts;
      return Promise.resolve(result);
    },
    findAllByAuthor: (authorIds = []) => {
      console.log("fetch posts");
      const result = authorIds.map(id =>
        R.filter(R.propEq("authorId", id), posts)
      );

      return Promise.resolve(result);
    },
  },
  authors: {
    find: id => Promise.resolve(R.filter(R.propEq("id", id), authors)),
    findAll: (filter = []) => {
      const result =
        filter.length > 0
          ? R.filter(entry => R.contains(entry.id, filter), authors)
          : authors;
      return Promise.resolve(result);
    },
    findAllWithPosts: (postIds = []) => {
      const result = authors.map(entry => {
        const posts = posts.filter(R.propEq("authorId", entry.id));
        //return { ...entry, posts };
      });
      return Promise.resolve(result);
    },
  },
};
