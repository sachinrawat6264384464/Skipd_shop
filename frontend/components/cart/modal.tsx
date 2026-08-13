"use client";

import clsx from "clsx";
import { Dialog, Transition } from "@headlessui/react";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Fragment, useState } from "react";
import OpenCart from "./open-cart";

import { LoginModal } from "components/auth/login-modal";

export default function CartModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const handleCheckoutClick = (e: React.MouseEvent) => {
    const token = localStorage.getItem("skipd_token");
    const user = localStorage.getItem("skipd_user");
    if (!token && !user) {
      e.preventDefault();
      closeCart();
      setIsLoginModalOpen(true);
    } else {
      closeCart();
    }
  };

  const cartItems = [
    {
      id: 1,
      title: "OnePlus Nord 4 5G (Obsidian Midnight)",
      price: 29999,
      originalPrice: 32999,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
      quantity: 1
    },
    {
      id: 2,
      title: "boAt Rockerz 450 Pro Bluetooth Headphones",
      price: 1799,
      originalPrice: 2999,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
      quantity: 1
    }
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <>
      <button aria-label="Open cart" onClick={openCart} className="relative cursor-pointer">
        <OpenCart quantity={cartItems.length} />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-gray-200 bg-white p-6 text-gray-900 shadow-2xl md:w-[420px]">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900">Cart Items</h3>
                  <p className="text-xs text-emerald-700 font-bold">{cartItems.length} Items in your cart</p>
                </div>
                <button aria-label="Close cart" onClick={closeCart} className="text-gray-500 hover:text-gray-900 font-black text-xl cursor-pointer">
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="flex h-full flex-col justify-between overflow-hidden pt-4">
                <ul className="grow overflow-auto space-y-4 pr-1">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex gap-4 p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white shrink-0 border border-gray-200">
                        <img src={item.image} alt={item.title} className="h-full w-full object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0 text-xs space-y-1">
                        <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900">₹{item.price.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] text-gray-400 line-through">₹{item.originalPrice.toLocaleString("en-IN")}</span>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-bold">Qty: {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Footer Subtotal & Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-gray-700">Subtotal</span>
                    <span className="text-xl font-black text-gray-900">₹{subtotal.toLocaleString("en-IN")}.00</span>
                  </div>

                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 text-center text-xs rounded-xl transition"
                  >
                    View Full Cart Page &rarr;
                  </Link>

                  <Link
                    href="/checkout"
                    onClick={handleCheckoutClick}
                    className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 text-center text-xs rounded-xl transition shadow-md shadow-emerald-600/20"
                  >
                    Proceed to Checkout &rarr;
                  </Link>
                </div>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
