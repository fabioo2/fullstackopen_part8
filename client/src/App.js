import React, { useState, useEffect } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { ALL_AUTHORS, ALL_GENRES, ALL_BOOKS } from './queries';

import Authors from './components/Authors';
import Books from './components/Books';
import Recommendations from './components/Recommendations';
import NewBook from './components/NewBook';

import LoginForm from './components/LoginForm';
import Notify from './components/Notify';

const App = () => {
    const allAuthorsQuery = useQuery(ALL_AUTHORS);
    const allBooksQuery = useQuery(ALL_BOOKS);
    const allGenresQuery = useQuery(ALL_GENRES);

    const [page, setPage] = useState('authors');
    const [user, setUser] = useState({});
    const [token, setToken] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const client = useApolloClient();

    useEffect(() => {
        if (!token) {
            const token = localStorage.getItem('books-user-token');
            setToken(token);
        }
    }, [token]);

    const logout = () => {
        setToken(null);
        localStorage.clear();
        client.cache.reset();
        client.resetStore();
        setPage('authors');
    };

    const notify = (message) => {
        setErrorMessage(message);
        setTimeout(() => {
            setErrorMessage(null);
        }, 10000);
    };

    if (allAuthorsQuery.loading || allBooksQuery.loading || allGenresQuery.loading) {
        return <div>loading...</div>;
    }

    const NavBar = () => {
        if (token) {
            return (
                <>
                    <button onClick={() => setPage('authors')}>authors</button>
                    <button onClick={() => setPage('books')}>books</button>
                    <button onClick={() => setPage('recommend')}>recommend</button>
                    <button onClick={() => setPage('add')}>add book</button>
                    <button onClick={logout}>logout</button>
                </>
            );
        } else {
            return (
                <>
                    <button onClick={() => setPage('authors')}>authors</button>
                    <button onClick={() => setPage('books')}>books</button>
                    <button onClick={() => setPage('login')}>login</button>
                </>
            );
        }
    };

    return (
        <div>
            <Notify errorMessage={errorMessage} />
            <NavBar />
            <Authors show={page === 'authors'} authors={allAuthorsQuery.data.allAuthors} token={token} />
            <Books show={page === 'books'} setPage={setPage} books={allBooksQuery} genres={allGenresQuery} />
            <Recommendations show={page === 'recommend'} user={user} />
            <NewBook show={page === 'add'} setPage={setPage} setError={setErrorMessage} />
            <LoginForm show={page === 'login'} setToken={setToken} setError={notify} setPage={setPage} setUser={setUser} />
        </div>
    );
};

export default App;
