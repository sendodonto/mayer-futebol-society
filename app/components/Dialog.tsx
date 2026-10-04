'use client';
import { useEffect,useRef } from 'react';
import { X } from 'lucide-react';
export default function Dialog({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:React.ReactNode;wide?:boolean}) {
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;d?.showModal();document.body.style.overflow='hidden';return()=>{d?.close();document.body.style.overflow='';};},[]);
 return <dialog ref={ref} className={wide?'modal wide':'modal'} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current)onClose();}}><div className="modal-head"><h2>{title}</h2><button className="icon-btn" aria-label="Fechar" onClick={onClose}><X size={22}/></button></div>{children}</dialog>;
}
