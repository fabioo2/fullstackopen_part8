import React, { useState, useEffect } from 'react';
import { useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import { LOGIN, ME } from '../queries';

const LoginForm = ({ setError, setToken, show, setPage, setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [meQuery] = useLazyQuery(ME);
    const client = useApolloClient();

    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            setError(error.graphQLErrors[0].message);
        },
    });

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value;
            setToken(token);
            localStorage.setItem('books-user-token', token);
            console.log(localStorage);
            client.refetchQueries({ include: [ME] });
        }
    }, [result.data]); // eslint-disable-line

    const submit = async (event) => {
        event.preventDefault();
        login({ variables: { username, password } });
        const user = await meQuery();
        console.log(user);
        setUser(user);
        setPage('authors');
    };

    if (!show) {
        return null;
    }

    return (
        <div>
            <form onSubmit={submit}>
                <div>
                    username <input value={username} onChange={({ target }) => setUsername(target.value)} />
                </div>
                <div>
                    password <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
                </div>
                <button type="submit">login</button>
            </form>
        </div>
    );
};

export default LoginForm;
