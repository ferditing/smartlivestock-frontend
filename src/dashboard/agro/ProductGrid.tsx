import { useEffect, useState } from "react";
import { fetchProviderProducts } from "../../api/agro.api";

type Product = {
  id:number;
  name:string;
  price:number;
  image_url?:string;
  company?:string;
  quantity:number;
};

export default function ProductGrid({ providerId }: {providerId:number}) {

  const [products,setProducts]=useState<Product[]>([]);

  useEffect(()=>{
    fetchProviderProducts(providerId).then(setProducts);
  },[providerId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map(p=>(
        <div key={p.id} className="card hover:shadow-lg">

          <img
            src={`${import.meta.env.VITE_API_URL}${p.image_url}`}
            className="h-40 w-full object-cover rounded-xl"
          />

          <div className="p-3">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.company}</p>

            <div className="flex justify-between mt-2">
              <span>KES {p.price}</span>
              <span className="text-xs text-gray-400">
                Stock: {p.quantity}
              </span>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}
