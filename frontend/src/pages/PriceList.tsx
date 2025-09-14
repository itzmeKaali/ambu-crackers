import { useState } from 'react'
import list1 from '../assets/price-list-img/list-1.jpeg'
import list2 from '../assets/price-list-img/list-2.jpeg'
import list3 from '../assets/price-list-img/list-3.jpeg'
import list4 from '../assets/price-list-img/list-4.jpeg'
import list5 from '../assets/price-list-img/list-5.jpeg'
import list6 from '../assets/price-list-img/list-6.jpeg'

const images = [list1, list2, list3, list4, list5, list6]

export default function PriceList() {
const [selectedImg, setSelectedImg] = useState<string | null>(null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-center leading-snug">
        Explore Our{' '}
        <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
          Price List
        </span>
      </h2>


      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-4 transition-transform transform hover:scale-105 duration-300"
          >
            <img
              src={img}
              alt={`Price List ${index + 1}`}
              className="w-full h-auto object-cover rounded-xl mb-4"
            />

            {/* Buttons in same line */}
            <div className="flex gap-2 w-full justify-center">
              <button
                onClick={() => setSelectedImg(img)}
                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-amber-300 to-orange-400 text-white font-semibold rounded-full shadow-md hover:shadow-lg text-sm transition"
              >
                View
              </button>
              <a
                href={img}
                download
                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-green-400 to-teal-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg text-sm text-center transition"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedImg(null)}
        >
          <div
            className="relative bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-2 right-2 text-white text-3xl font-bold z-50 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition"
            >
              &times;
            </button>

            {/* Image */}
            <img
              src={selectedImg}
              alt="Selected Price List"
              className="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
