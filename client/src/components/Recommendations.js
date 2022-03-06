import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ME, RECOMMENDED_BOOKS } from '../queries';

const Recommendations = (props) => {
    const [favoriteGenre, setFavouriteGenre] = useState('');
    const [books, setBooks] = useState([]);
    const meQuery = useQuery(ME, {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
    });

    useEffect(() => {
        if (props.user && meQuery.data && props.show) {
            setFavouriteGenre(meQuery.data.me.favoriteGenre);
        }
    }, [meQuery.data, props.show, props.user]);

    const recommendedBooksQuery = useQuery(RECOMMENDED_BOOKS, { variables: { genre: favoriteGenre } });

    useEffect(() => {
        if (props.show && recommendedBooksQuery.data) {
            setBooks(recommendedBooksQuery.data.allBooks);
        }
    }, [recommendedBooksQuery.data, props.show]);

    if (!props.show) {
        return null;
    } else if (recommendedBooksQuery.loading || meQuery.loading) {
        return <p>loading...</p>;
    }

    return (
        <div>
            <h2>recommendations</h2>
            <p>
                books in your favourite genre <strong>{favoriteGenre}</strong>
            </p>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {books.map((a) => (
                        <tr key={a.title}>
                            <td>{a.title}</td>
                            <td>{a.author.name}</td>
                            <td>{a.published}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Recommendations;
