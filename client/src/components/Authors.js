import React from 'react';
import SetBirthYear from './SetBirthYear';

const Authors = (props) => {
    if (!props.show) {
        return null;
    }
    const authors = props.authors;

    return (
        <div>
            <h2>authors</h2>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>born</th>
                        <th>books</th>
                    </tr>
                    {authors.map((a) => (
                        <tr key={a.name}>
                            <td>{a.name}</td>
                            <td>{a.born}</td>
                            <td>{a.bookCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <SetBirthYear authors={props.authors} token={props.token} />
        </div>
    );
};

export default Authors;
