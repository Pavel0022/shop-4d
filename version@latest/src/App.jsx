import './App.css'
import Header from './components/Header'
import ProductCard from './components/ProductCard'
import './components/ProductCard.css'

function App() {
  return (
    <div>
      <Header variant="guest" />
      {/* Ниже оставлены для будущей авторизации: */}
      {false && (
        <>
          <div style={{ height: 24 }} />
          <Header variant="user" />
          <div style={{ height: 24 }} />
          <Header variant="manager" />
        </>
      )}
      <main>
        <div className="p-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <ProductCard
              key={i}
              inCart={i % 3 === 1}
              isFav={JSON.parse(localStorage.getItem('fav') || '[]').some((p) => p.id === i)}
              onToggleFav={() => {
                const fav = JSON.parse(localStorage.getItem('fav') || '[]')
                const exists = fav.some((p) => p.id === i)
                const product = { id: i, title: 'Комбайн КЗС-1218 «ДЕСНА-ПОЛЕСЬЕ GS12»', price: 44.5, oldPrice: 50.5, discount: 50 }
                const next = exists ? fav.filter((p) => p.id !== i) : [...fav, product]
                localStorage.setItem('fav', JSON.stringify(next))
                // триггер перерисовки
                window.dispatchEvent(new Event('hashchange'))
              }}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
