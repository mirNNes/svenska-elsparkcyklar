import { useState } from 'react'
import '../css/App.css'
import { Link } from 'react-router-dom';

function Home() {
  const [inputs, setInputs] = useState({});

  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  function handleSubmit(e) {
    e.preventDefault();
    const username = inputs.username;
    const password = inputs.password;
    alert(username);
    alert(password);
  }

  return (
    <div>
      <h2>Välkommen!</h2>
        
    </div>
  )
}

export default Home