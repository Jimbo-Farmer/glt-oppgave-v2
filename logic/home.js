import {baseUrl} from "../resources/baseUrl.js";

const errorContainer = document.querySelector(".error-container");
const searchInput = document.querySelector(".main-search");
const dropDown = document.querySelector(".search-dropdown");
const form = document.querySelector("form");
form.onsubmit = (e)=>{
  e.preventDefault();
}
let url = baseUrl;
let enheterListe = [];

// Funksjon for å hente enheter fra APIen
async function hentEnheter(){
  try {
    const svar = await fetch(url);
    const enheter = await svar.json();
    if(enheter._embedded){
      enheterListe = enheter._embedded.enheter;
      errorContainer.innerHTML = "";
      tegneDropdown();
    } else {
      dropDown.innerHTML = "<p>Ingen resultater</p>"
    }
  } catch (error) {
    errorContainer.innerHTML = `Bekglager, en feil har oppstått. Detaljer: ${error}`;
    console.log("error")
  }
};
// 982831962
// Detekt tastopp og hent enheter
searchInput.onkeyup = (event)=>{
  dropDown.innerHTML = "";
  if(!event.target.value){
    return;
  }
  if(isNaN(parseInt(event.target.value))){
    url = baseUrl + "enheter?navn=" + event.target.value.split(" ").join("+");
  } else if(!isNaN(parseInt(event.target.value)) && event.target.value.trim().length === 9){
    url = baseUrl + "enheter?organisasjonsnummer=" + event.target.value.trim();
  } else return;
  hentEnheter();
}

function tegneDropdown(){
  enheterListe.forEach(enhet => {
    dropDown.innerHTML += 
    `<div class="search-dropdown__item">
      <div>${enhet.organisasjonsnummer}</div>
      <div>${enhet.navn}</div>
    </div>`
  });
  const dropdownItems = document.querySelectorAll(".search-dropdown__item");
  const modal = document.querySelector(".modal");
  for(let i = 0; i< dropdownItems.length; i++){
    const hjemmeside = enheterListe[i].hjemmeside ? `<div>Hjemmeside: <a href="https://${enheterListe[i].hjemmeside}"> ${enheterListe[i].hjemmeside}<a/></div>` : "";
    let gate = "-gate-";
    let kommune = "-kommune-";
    let postnummer = "-postnummer";
    if(enheterListe[i].forretningsadresse){
      gate = enheterListe[i].forretningsadresse.adresse[0] ? enheterListe[i].forretningsadresse.adresse[0] : "-Ikke tilgjengelig-";
      kommune = enheterListe[i].forretningsadresse.kommune ? enheterListe[i].forretningsadresse.kommune : "-Ikke tilgjengelig-";
      postnummer = enheterListe[i].forretningsadresse.postnummer ? enheterListe[i].forretningsadresse.postnummer : "-Ikke tilgjengelig-";
    }
    dropdownItems[i].addEventListener("click", ()=>{
      const googleMapsLink = "https://www.google.com/maps/search/?api=1&query=" + gate.split(" ").join("+") + "%2C" + enheterListe[i].forretningsadresse.postnummer;
      modal.classList.add("åpen");
      modal.innerHTML = `
      <button class="lukke"></button>
      <h3>${enheterListe[i].navn}</h3>
      <div>Organisasjonsnummer: ${enheterListe[i].organisasjonsnummer}</div>
      <div>Organisasjonsform: ${enheterListe[i].organisasjonsform.beskrivelse}</div>
      <div>Adresse:</div>
      <a target=”_blank” href="${googleMapsLink}"><p>${gate}<br>
        ${kommune}<br>
        ${postnummer}
        </p>
      </a>
      ${hjemmeside}
      `;
      const closeButton = document.querySelector(".lukke");
      closeButton.onclick = ()=>{
      modal.classList.remove("åpen");
      modal.innerHTML = "";
      }
    })
  }
}
