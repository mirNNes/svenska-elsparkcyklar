import '../css/App.css'
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <div className='welcome_text'>
        <h2>Välkommen till Svenska Sparkcyklar AB!</h2>
        <p>Svenska Elsparkcyklar AB är ett svenskt företag specialiserat på moderna, hållbara och lättanvända 
          elsparkcyklar för både privatpersoner och företag. Vi fokuserar på kvalitet, säkerhet och smart design, 
          och erbjuder produkter som gör det enkelt att ta sig fram i vardagen på ett miljövänligt sätt. 
          Med kundnöjdhet och innovation i centrum strävar vi efter att leverera pålitliga lösningar för framtidens 
          urbana mobilitet.
        </p>
      </div>
      <div class="home_links">
        {/* <div class="link_card"> */}
          <Link class="link_card" to="/account">Se dina kontouppgifter</Link>
        {/* </div>
        <div class="link_card"> */}
          <Link class="link_card" to="/rides">Se din resehistorik</Link>
        {/* </div>
        <div class="link_card"> */}
          <Link class="link_card" to="/invoices">Se dina fakturor</Link>
        {/* </div> */}
      </div>
        
    </div>
  )
}

export default Home