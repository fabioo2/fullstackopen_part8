import React, { useState } from 'react';
import Select from 'react-select';
import { useMutation } from '@apollo/client';

import { EDIT_AUTHOR, ALL_AUTHORS } from '../queries';

const SetBirthYear = ({ authors }) => {
    const [born, setBorn] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [editAuthor] = useMutation(EDIT_AUTHOR, {
        refetchQueries: [{ query: ALL_AUTHORS }],
    });

    const options = authors.map((author) => {
        return { value: author.name, label: author.name };
    });

    const submit = async (event) => {
        event.preventDefault();

        editAuthor({ variables: { name: selectedOption.value, setBornTo: Number(born) } });

        setSelectedOption(null);
        setBorn('');
    };

    return (
        <div>
            <h2>Set Birthyear</h2>
            <form onSubmit={submit}>
                <Select value={selectedOption} onChange={setSelectedOption} options={options} />
                <div>
                    born
                    <input value={born} onChange={({ target }) => setBorn(target.value)} />
                </div>

                <button type="submit">update author</button>
            </form>
        </div>
    );
};

export default SetBirthYear;
