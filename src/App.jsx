import { useState, useEffect, useMemo } from 'react'
import './App.css'

function App() {
  //State for storing to fetch array  of Disney Characters
  const [characters, setCharacters] = useState([]) 
  // The State to manage the loading status during with Application Programming Interface (API)
  const [isLoading, setIsLoading] = useState(true)
  //The text box for input for search disney charecter name
  const [search, setSearch] = useState("")
  // Choose flim in the dropdown filter
  const [chooseFilm, setChooseFilm] = useState("All")

  // Fetch a Disney character data
  useEffect(() => {
    async function disneyFetch() {
      try {
        const response = await fetch("https://api.disneyapi.dev/character")
        const data = await response.json()
        setCharacters(data.data)
        setIsLoading(false)
        console.log(data)
      } catch (error) {
        console.log('Error fetching Disney character data:', error)
        setIsLoading(false)
      }
    }
    disneyFetch()
  }, []) //Empty dependency array

  //  Compute stats and dropdown film options using Usememo 
  const { optionsFilm, charactersWithFilms, avgFilmsPerChar } = useMemo(() => { 
    const filmCounts = {}
    let totalFilms = 0 // The total number of disney films across all characters
    let charsWithFilms = 0 // There is a count of characters with least one film

    characters.forEach((c) => {
      const films = Array.isArray(c.films) ? c.films : [] //disney films is an array
      if (films.length > 0) charsWithFilms += 1 // Counted characters in Films
      totalFilms += films.length // Add a number  of films with average calculation
      films.forEach((f) => {
        if (!f) return // null film names     
        filmCounts[f] = (filmCounts[f] || 0) + 1
      })
    })

    // Sort films by popularity and select top 30
    const sortedFilms = Object.entries(filmCounts)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])

    const topFilms = sortedFilms.slice(0, 30) 
    const options = ["All", ...topFilms] // It is dropdown options that includes ALL
    const avg = characters.length > 0 ? totalFilms / characters.length : 0 // It can calculate average disney films per character 

    return {
      optionsFilm: options,
      charactersWithFilms: charsWithFilms,
      avgFilmsPerChar: avg,
    }
  }, [characters]) 

  // Filter logic for search + film selection
  const filteredCharacters = characters
    .filter((char) =>
      char.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    .filter((char) => {
      if (chooseFilm === "All") return true // It show  all if "All" is choosed
      const films = Array.isArray(char.films) ? char.films : []
      return films.includes(chooseFilm) //It only including disney characters from choosing disney film
    })
    
  return (
    <div className='app'>
      <div className='main'>
        <h1>Disney Characters Data Dashboard</h1>

        {isLoading ? (
          <p>Loading characters...</p> //It shows a loading message while it fetches a disney character
        ) : (
          <div>
            {/* Disney Summary statistics */}
            <section className='summary'>
              <div className='stat'>
                <strong>Total characters fetched:</strong> {characters.length}
              </div>
              <div className='stat'>
                <strong>Characters with films:</strong> {charactersWithFilms}
              </div>
              <div className='stat'>
                <strong>Avg. films per character:</strong>{" "}
                {avgFilmsPerChar.toFixed(2)}
              </div>
            </section>

            {/* Search and Filter Controls */}
            <section className='controls'>
              <input
                type="text"
                placeholder="Search Disney Characters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}//It updates the state
                className='search-bar'
              />

              <label> 
                <span>Filter by film:</span>
                <select
                  value={chooseFilm}
                  onChange={(e) => setChooseFilm(e.target.value)} // It updates the disney film filter
                >
                  {optionsFilm.map((film) => (
                    <option key={film} value={film}>
                      {film}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            {/* Disney Character List */}
            <section className='results'>
              <p>
                Showing {Math.min(filteredCharacters.length, 10)} of{" "}
                {filteredCharacters.length} matching characters
              </p>
              <ul>
                {filteredCharacters.slice(0, 10).map((char) => (
                  <li key={char._id} className='characters-row'>
                    <div className='char-name'>{char.name}</div>
                    <div className='char-feature'>
                      {char.films && char.films.length > 0 ? (
                        <span>Film: {char.films[0]}</span>
                      ) : (
                        <span>No film listed</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* No Results */}
            {filteredCharacters.length === 0 && (
              <p>
                No Disney Characters found matching "{search}" and film "
                {chooseFilm === "All" ? "Any" : chooseFilm}".
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
