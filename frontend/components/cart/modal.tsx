"use client";

import clsx from "clsx";
import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment, useState, useEffect } from "react";
import OpenCart from "./open-cart";

import { LoginModal } from "components/auth/login-modal";

import { getUserCartKey, getCartStore, saveCartStore } from "lib/utils";

export default function CartModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const loadCart = () => {
    try {
      const items = getCartStore();
      setCartItems(items);
    } catch (e) {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();

    const handleCartSync = () => loadCart();
    window.addEventListener("storage", handleCartSync);
    window.addEventListener("skipd_cart_updated", handleCartSync);
    window.addEventListener("skipd_cart_changed", handleCartSync);
    window.addEventListener("skipd_auth_changed", handleCartSync);

    return () => {
      window.removeEventListener("storage", handleCartSync);
      window.removeEventListener("skipd_cart_updated", handleCartSync);
      window.removeEventListener("skipd_cart_changed", handleCartSync);
      window.removeEventListener("skipd_auth_changed", handleCartSync);
    };
  }, []);

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

  const removeItem = (targetId: any, targetHandle?: string) => {
    const updated = cartItems.filter((item) => {
      if (targetId != null && item.id != null && String(item.id) === String(targetId)) return false;
      if (targetHandle && item.handle && item.handle === targetHandle) return false;
      return true;
    });
    setCartItems(updated);
    saveCartStore(updated);
  };

  const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

  return (
    <>
      <button aria-label="Open cart" onClick={openCart} className="relative cursor-pointer">
        <OpenCart quantity={totalQuantity} />
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
                  <p className="text-xs text-emerald-700 font-bold">{totalQuantity} Items in your cart</p>
                </div>
                <button aria-label="Close cart" onClick={closeCart} className="text-gray-500 hover:text-gray-900 font-black text-xl cursor-pointer">
                  ✕
                </button>
              </div>

              {/* Items List or Empty State */}
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
                    🛒
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-gray-900">Your cart is currently empty</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Explore our best-selling electronics, fashion, and accessories to add items to your cart!
                    </p>
                  </div>
                  <Link
                    href="/search"
                    onClick={closeCart}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl transition shadow-xs"
                  >
                    Explore Store &rarr;
                  </Link>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden pt-4">
                  <ul className="grow overflow-auto space-y-4 pr-1">
                    {cartItems.map((item) => (
                      <li key={item.id} className="flex gap-4 p-3 bg-gray-50 border border-gray-200 rounded-2xl relative group items-center">
                        <Link href={`/product/${item.handle || item.id}`} onClick={closeCart} className="flex gap-3 flex-1 min-w-0 group/item cursor-pointer items-center">
                          <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white shrink-0 border border-gray-200 group-hover/item:border-emerald-400 transition">
                            <img src={item.image} alt={item.title} className="h-full w-full object-contain p-1 group-hover/item:scale-105 transition duration-200" />
                          </div>
                          <div className="flex-1 min-w-0 text-xs space-y-1">
                            <h4 className="font-bold text-gray-900 truncate group-hover/item:text-emerald-700 transition">{item.title}</h4>
                            <div className="flex items-center justify-between">
                              <span className="font-black text-sm text-gray-900">₹{(item.price || 0).toLocaleString("en-IN")}</span>
                              <span className="text-[10px] text-gray-500 font-bold">Qty: {item.quantity || 1}</span>
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={() => removeItem(item.id, item.handle)}
                          className="text-gray-400 hover:text-red-600 font-black text-sm p-1 cursor-pointer transition"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm font-extrabold text-gray-900">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Taxes and shipping calculated at checkout.</p>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <Link
                        href="/cart"
                        onClick={closeCart}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs py-3 text-center rounded-xl transition"
                      >
                        View Full Cart
                      </Link>
                      <Link
                        href="/checkout"
                        onClick={handleCheckoutClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 text-center rounded-xl transition shadow-xs"
                      >
                        Proceed to Checkout
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
