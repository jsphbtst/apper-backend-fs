import express from "express"; // -> modules
import fs from "fs";
import path from "path";
// const express = require("express"); // -> commonjs

const app = express();
app.use(express.json()); // allows express to parse JSON from a network request

const PORT = 3000;

const getAllBooks = () => {
  const pathToFile = path.resolve("./src/db/data.json");
  const dbData = fs.readFileSync(pathToFile);
  const data = JSON.parse(dbData);
  return data;
};

function createBook(newBook) {
  const pathToFile = path.resolve("./src/db/data.json");
  const dbData = fs.readFileSync(pathToFile);
  const data = JSON.parse(dbData);
  const books = data.books;
  books.push(newBook);
  const dbDataStringified = JSON.stringify(data);
  fs.writeFileSync(pathToFile, dbDataStringified);
}

function updateTitle(bookId, newTitle) {
  const pathToFile = path.resolve("./src/db/data.json");
  const dbData = fs.readFileSync(pathToFile);
  const data = JSON.parse(dbData);
  for (let idx = 0; idx < data.books.length; idx++) {
    const id = data.books[idx].id;
    if (id !== bookId) continue;

    data.books[idx].title = newTitle;
  }

  const dbDataStringified = JSON.stringify(data);
  fs.writeFileSync(pathToFile, dbDataStringified);
}

function deleteBook(bookId) {
  const pathToFile = path.resolve("./src/db/data.json");
  const dbData = fs.readFileSync(pathToFile);
  const data = JSON.parse(dbData);
  const books = data.books;
  const filteredBooks = books.filter((book) => book.id !== bookId);
  data.books = filteredBooks;
  const dbDataStringified = JSON.stringify(data);
  fs.writeFileSync(pathToFile, dbDataStringified);
}

app.get("/", (request, response) => {
  response.send({ message: "hello, world SHEEEEESH!", ...request.query });
});

// let visitorCount = 0;
// function processVisitorCount(request, response, next) {
//   visitorCount++;
//   console.log("visitorCount", visitorCount);
//   next();
// }

// /books -> getAllBooks
app.get("/books", (request, response) => {
  const filters = request.query["filter"];
  let allBooks = getAllBooks();
  if (!filters) {
    response.send({ books: allBooks.books });
    return;
  }
  const author = filters.author || "";
  const title = filters.title || "";

  let filteredBooks = allBooks.books;
  if (author) {
    filteredBooks = filteredBooks.filter((book) =>
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  if (title) {
    filteredBooks = filteredBooks.filter((book) =>
      book.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  response.send({ books: filteredBooks });
});

// /books/:bookId -> getSpecificBook
app.get("/books/:bookId", (request, response) => {
  const bookIdParam = request.params.bookId;
  const allBooks = getAllBooks();
  const book =
    allBooks.books.find(({ id: bookId }) => {
      return bookId === bookIdParam;
    }) || null;
  response.send({ book });
});

function parseCreateBookRequest(request, response, next) {
  const newBody = {
    id: request.body.id,
    title: request.body.title,
    subtitle: request.body.subtitle,
    author: request.body.author,
    published: request.body.published,
    publisher: request.body.publisher,
    pages: request.body.pages,
    description: request.body.description,
    website: request.body.website,
  };
  request.body = newBody;
  next();
}

app.post("/books", parseCreateBookRequest, (request, response) => {
  const body = request.body;
  createBook(body);
  response.send(body);
});

app.patch("/books/:bookId", (request, response) => {
  const bookId = request.params.bookId;
  const body = request.body;
  const newTitle = body.newTitle;
  if (!newTitle) {
    return response.send({ message: "Title required." });
  }
  updateTitle(bookId, newTitle);
  response.send({ message: "Resource has been updated." });
});

app.delete("/books/:bookId", (request, response) => {
  const bookId = request.params.bookId;
  if (!bookId) {
    return response.send({ message: "BookId is required." });
  }

  deleteBook(bookId);
  response.send({ message: "Successfully deleted book." });
});

// this is a middleware
function cleanRequestQueries(request, response, next) {
  // by default, if no request params are submitted, we get {}
  const isRequestQueryEmpty = Object.keys(request.query).length === 0;
  if (isRequestQueryEmpty) next();

  const newQueryParams = {
    name: request.query.name || "",
  };

  request.query = newQueryParams;
  next();
}

app.get("/anime", cleanRequestQueries, (request, response) => {
  console.log(request.query);
  response.send("WEEEEB");
});

app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}.`);
});
