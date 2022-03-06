import React from 'react';

const Books = (props) => {
    if (!props.show) {
        return null;
    }
    const books = props.books.data.allBooks;
    const genres = props.genres.data.allBooks.map((genre) => {
        return genre.genres;
    });
    const flatGenres = genres.flat();
    const uniqueGenres = [...new Set(flatGenres)];
    //push an all genres to the array
    uniqueGenres.push('all genres');
    return (
        <div>
            <h2>books</h2>

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
            <div>
                <h2>select a genre</h2>
                {uniqueGenres.map((genre, i) => {
                    if (genre === 'all genres') {
                        return (
                            <button onClick={() => props.books.refetch({ genre: '' })} style={{ marginRight: '4px' }} key={i}>
                                {genre.toLowerCase()}
                            </button>
                        );
                    }
                    return (
                        <button onClick={() => props.books.refetch({ genre: genre })} style={{ marginRight: '4px' }} key={i}>
                            {genre.toLowerCase()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Books;
