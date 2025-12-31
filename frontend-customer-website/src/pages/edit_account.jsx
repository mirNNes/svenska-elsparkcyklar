import React, {useState} from 'react';
// import { useForm, Controller } from 'react-hook-form'
// import { Link } from 'react-router-dom';

function EditAccount() {
    const [inputs, setInputs] = useState({});

  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = inputs.name;
    const email = inputs.email;
    const password = inputs.password;
    alert(name);
    alert(email);
    alert(password);
  }

  return (
    <form class="create_account_form" onSubmit={handleSubmit}>
      <h3>Skapa nytt konto</h3>
      <label for="name">Namn:</label>
      <input
          class="create_account_input"
          type="text"
          name="name"
          value={inputs.name}
          onChange={handleChange}
        />
      <label for="username">Email:</label>
      <input
          class="create_account_input"
          type="email"
          name="email"
          value={inputs.email}
          onChange={handleChange}
        />
      <label for="password">Lösenord:</label>
      <input
          class="create_account_input"
          type="password"
          name="password"
          value={inputs.password}
          onChange={handleChange}
        />
      <input class="create_account_btn" type="submit" value="Spara ändringar"/>
    </form>
  )
}

export default EditAccount
