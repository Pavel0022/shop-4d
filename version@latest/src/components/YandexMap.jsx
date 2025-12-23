import { useEffect, useRef, useState } from 'react'

const MAP_CENTER = [67.4974, 64.0611] // пример: Салехард

function loadYandexScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.ymaps) {
      resolve(window.ymaps)
      return
    }
    const existing = document.querySelector('script[data-ymaps="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.ymaps))
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${apiKey}`
    script.dataset.ymaps = 'true'
    script.async = true
    script.onload = () => resolve(window.ymaps)
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export default function YandexMap() {
  const ref = useRef(null)
  const initialized = useRef(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const apiKey = import.meta.env.VITE_YANDEX_MAPS_KEY
    if (!apiKey) {
      setError('Укажите VITE_YANDEX_MAPS_KEY в .env, чтобы загрузить карту')
      return
    }

    let mapInstance

    loadYandexScript(apiKey)
      .then((ymaps) => {
        ymaps.ready(() => {
          if (!ref.current) return
          mapInstance = new ymaps.Map(ref.current, {
            center: MAP_CENTER,
            zoom: 12,
            controls: ['zoomControl', 'fullscreenControl'],
          })

          const store = new ymaps.Placemark(MAP_CENTER, {
            balloonContent: 'Магазин «Северяночка»',
          })
          mapInstance.geoObjects.add(store)
        })
      })
      .catch(() => {
        setError('Не удалось загрузить карту Яндекса')
      })

    return () => {
      if (mapInstance) {
        mapInstance.destroy()
      }
    }
  }, [])

  if (error) {
    return (
      <div className="map-placeholder">
        <span>{error}</span>
      </div>
    )
  }

  return <div ref={ref} className="map-placeholder" />
}


