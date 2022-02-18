const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server');
const mongoose = require('mongoose');
const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');
const config = require('./utils/config');
const MONGODB_URI = config.MONGODB_URI;

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY';

console.log('connecting to ', MONGODB_URI);

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to mongoDB');
    })
    .catch((error) => {
        console.log('error connected to MongoDB:', error.message);
    });

const typeDefs = gql`
    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }

    type Token {
        value: String!
    }
    type Author {
        name: String!
        born: Int
        id: ID!
        books: [Book]
        bookCount: Int!
    }

    type Book {
        title: String!
        published: Int!
        author: Author!
        id: ID!
        genres: [String!]!
    }

    type Query {
        authorCount: Int!
        bookCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
        me: User
    }

    type Mutation {
        addBook(title: String!, author: String!, published: Int!, genres: [String!]!): Book
        editAuthor(name: String!, setBornTo: Int!): Author
        createUser(username: String!, favoriteGenre: String!): User
        login(username: String!, password: String!): Token
    }
`;

const resolvers = {
    Query: {
        authorCount: () => Author.collection.countDocuments(),
        bookCount: () => Book.collection.countDocuments(),
        allAuthors: (root, args) => {
            return Author.find({});
        },
        allBooks: async (root, args) => {
            if (args.author && args.genre) {
                const filteredByAuthorAndGenre = await Book.find({ author: args.author, tags: args.genre });
                return filteredByAuthorAndGenre;
            } else if (args.author) {
                const filteredByAuthor = await Book.find({ author: args.author });
                return filteredByAuthor;
            } else if (args.genre) {
                const filteredByGenre = await Book.find({ genres: args.genre });
                return filteredByGenre;
            } else {
                const books = await Book.find({});
                return books;
            }
        },
        me: (root, args, context) => {
            return context.currentUser;
        },
    },
    Author: {
        books: async (author) => {
            const books = await Book.find({ author: author.id });
            return books;
        },
        bookCount: async (author) => {
            const bookCount = await Book.count({ author: author.id });
            return bookCount;
        },
    },

    Book: {
        author: async (book) => {
            const author = await Author.findOne({ _id: book.author.toString() });
            console.log(author);
            return author;
        },
    },

    Mutation: {
        addBook: async (root, args, context) => {
            const currentUser = context.currentUser;

            if (!currentUser) {
                throw new AuthenticationError('not authenticated');
            }

            let author = await Author.findOne({ name: args.author });
            if (!author) {
                author = new Author({ name: args.author });

                try {
                    await author.save();
                } catch (error) {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    });
                }
            }
            const book = Book({ ...args, author: author.id });
            try {
                await book.save();
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                });
            }
            return book;
        },

        editAuthor: async (root, args, context) => {
            const currentUser = context.currentUser;

            if (!currentUser) {
                throw new AuthenticationError('not authenticated');
            }

            const author = await Author.findOne({ name: args.name });
            if (!author) {
                return null;
            }
            const id = author.id;
            //how to use spread operator here as {...author, born: args.setBornTo} didn't work
            const updatedAuthor = { id: author.id, name: author.name, born: args.setBornTo };
            try {
                const returnedAuthor = await Author.findByIdAndUpdate(id, updatedAuthor, {
                    new: true,
                });
                return returnedAuthor;
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                });
            }
        },
        createUser: async (root, args) => {
            const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre });

            return user.save().catch((error) => {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                });
            });
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username });

            if (!user || args.password !== 'secret') {
                throw new UserInputError('wrong credentials');
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            };

            return { value: jwt.sign(userForToken, JWT_SECRET) };
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
            const currentUser = await User.findById(decodedToken.id);
            return { currentUser };
        }
    },
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
