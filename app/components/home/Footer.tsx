import Image from "next/image";
export default function Footer() {
  return (
    <footer className="bg-[#0B1120] text-gray-400 py-16 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Contenedor Principal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* 1. Marca y Descripción */}
          <div className="">
            <div className="flex items-center gap-2 mb-6">
              {/* Logo Casa */}
               {/* LOGO MOBILE */}
                  <div className="relative h-16 md:h-20 w-[200px] md:w-[260px]">
  <Image
    src="/logo2.png"
    alt="Logo Inmobiliaria"
    fill
    className="object-contain bg-white/90 rounded-lg p-1"
  />
</div>
             
            </div>
            <p className="text-sm leading-relaxed mb-8">
              Dedicados a ayudarte a encontrar no solo una casa, sino un hogar donde crear recuerdos inolvidables. 
            </p>
            {/* Redes Sociales */}
            <div className="flex gap-3">
              <a href="#" className="bg-[#1E293B] hover:bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="#" className="bg-[#1E293B] hover:bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="bg-[#1E293B] hover:bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" className="bg-[#1E293B] hover:bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          {/* 2. Enlaces Rápidos */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Inicio</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Propiedades</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Agentes</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* 3. Contacto */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contacto</h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Av. Libertador 1234, Oficina 500,<br />Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>+54 11 1234-5678</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>info@inmomundo.com</span>
              </li>
            </ul>
          </div>

          {/* 4. Newsletter
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Newsletter</h3>
            <p className="text-sm mb-4">
              Suscríbete para recibir las últimas novedades y ofertas exclusivas.
            </p>
            {/* Input Form 
            <div className="relative mb-3">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="w-full bg-[#162032] text-white placeholder-gray-500 border border-[#23314B] focus:border-blue-500 rounded-lg py-3 pl-4 pr-14 outline-none text-sm transition-colors"
              />
              <button 
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md w-10 flex items-center justify-center transition-colors"
                aria-label="Suscribirse"
              >
                <svg className="w-4 h-4 -ml-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <p className="text-[11px] text-gray-500 leading-tight">
              Al suscribirte aceptas nuestra Política de Privacidad.
            </p>
          </div>*/}

        </div> 

        {/* Separador y Copyright */}
        <div className="border-t border-[#1E293B] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <p>© 2026 InmoMundo. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
            <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
          </div>
        </div>

      </div>
    </footer>
  );
}