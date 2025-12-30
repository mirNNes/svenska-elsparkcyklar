import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';


function Account() {
  return (
    <div>
      <h2>Konto detaljer</h2>
      <ul>
        <li>
          Namn: John Doe
        </li>
        <li>
          Email: johndoe@gmail.com
        </li>
        <li>
          Lösenord: test123
        </li>
      </ul>
    </div>
  );
}



export default Account