import { useState } from 'react';
import { ArrowUpRight, ArrowRight, Users, Goal, Box, Menu, X, Phone, Camera, CalendarDays } from 'lucide-react';
import Dialog from '../app/components/Dialog';
import type { Court } from '../lib/domain';

export const BOOKING_ORIGIN = 'https://mayer-futebol-society.ezkn-p1.chatgpt.site';
const INSTAGRAM = 'https://www.instagram.com/mayeresportes/';
const OFFICIAL_APP = 'https://play.google.com/store/apps/details?id=com.ajatus.schedule';
const asset = (path: string) => import.meta.env.BASE_URL + path;
const units = [
  { name: 'Mayer Dom Pedrito', phone: '5551998368317', display: '(51) 99836-8317' },
  { name: 'Mayer 52', phone: '5551999390997', display: '(51) 99939-0997' },
  { name: 'Mayer 61', phone: '5551998077593', display: '(51) 99807-7593' },
];
const data = {
  fut5: { title: 'Fut5', desc: 'Jogo rápido. Time fechado.', players: '5 × 5 jogadores', size: '30 × 18 m' },
  fut7: { title: 'Fut7', desc: 'Mais espaço para o seu futebol.', players: '7 × 7 jogadores', size: '50 × 30 m' },
};
function Brand() {
  return <><img src={asset('images/official/mayer-escudo.jpg')} width={150} height={150} alt="" /><span>MAYER<small>ESPORTES</small></span></>;
}
export default function PagesLanding() {
  const [court, setCourt] = useState<Court>('fut5');
  const [menu, setMenu] = useState(false);
  const [viewer, setViewer] = useState<Court | null>(null);
  const [unit, setUnit] = useState(0);
  const contact = units[unit];
  const whatsapp = `https://wa.me/${contact.phone}?text=${encodeURIComponent(`Olá! Gostaria de consultar horários e valores na ${contact.name}.`)}`;
  const closeMenu = () => setMenu(false);
  return <>
    <a className="skip" href="#conteudo">Ir para o conteúdo</a>
    <header className="header">
      <a className="brand" href="#inicio" aria-label="Mayer Esportes, início" onClick={closeMenu}><Brand /></a>
      <nav id="navegacao" aria-label="Navegação principal" className={menu ? 'nav open' : 'nav'}>
        <a href="#campos" onClick={closeMenu}>Fut5 & Fut7</a>
        <a href="#sobre" onClick={closeMenu}>Sobre a Mayer</a>
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Instagram <ArrowUpRight size={14} /></a>
        <a className="nav-cta" href="#reservas" onClick={closeMenu}>Reservar horário <ArrowUpRight size={17} /></a>
      </nav>
      <button className="mobile-menu icon-btn" aria-controls="navegacao" aria-expanded={menu} aria-label={menu ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
    </header>
    <main id="conteudo">
      <section id="inicio" className="hero mayer-hero">
        <div className="hero-content container">
          <div className="hero-copy"><h1>Seu próximo jogo<br />começa na <span>Mayer.</span></h1>
            <p>Escolha seu campo, reúna a turma e combine o horário.<br /> O resto é bola rolando.</p>
            <div className="hero-actions"><a className="button orange" href="#reservas">Encontrar meu horário <ArrowUpRight size={20} /></a><a className="hero-secondary" href="#campos">Conhecer os campos <ArrowRight size={18} /></a></div>
          </div>
          <div className="hero-model">
            <div className="hero-model-tabs" role="group" aria-label="Modelo em destaque">{(['fut5', 'fut7'] as Court[]).map(c => <button key={c} aria-pressed={court === c} className={court === c ? 'selected' : ''} onClick={() => setCourt(c)}>{data[c].title}<span>{data[c].players}</span></button>)}</div>
            <img src={asset(`images/${court}.png`)} width={1600} height={1200} alt={`Perspectiva do modelo ilustrativo ${data[court].title}`} fetchPriority="high" />
            <div className="hero-model-bottom"><span>Modelo ilustrativo · {data[court].title}</span><button onClick={() => setViewer(court)}><Box size={16} />Ver em 3D <ArrowUpRight size={15} /></button></div>
          </div>
        </div>
      </section>
      <div className="mayer-services container" aria-label="Estrutura divulgada no perfil oficial"><span>Quadras</span><span>Churrasqueiras</span><span>Eventos</span><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">@mayeresportes <Camera size={18} /></a></div>
      <section id="campos" className="booking-section container">
        <div className="section-title"><h2>Seu time.<br /><span>Seu jeito de jogar.</span></h2><p>Explore as propostas de Fut5 e Fut7. Confirme a modalidade disponível na unidade ao reservar.</p></div>
        <div className="booking-layout">
          <div className="field-select">
            <div className="court-switch" role="group" aria-label="Escolha o modelo de campo">{(['fut5', 'fut7'] as Court[]).map(c => <button key={c} className={court === c ? 'selected' : ''} aria-pressed={court === c} onClick={() => setCourt(c)}><span>{data[c].title}</span><small>{c === 'fut5' ? '5 contra 5' : '7 contra 7'}</small></button>)}</div>
            <div className="field-render"><img src={asset(`images/${court}.png`)} width={1600} height={1200} alt={`Modelo ilustrativo da quadra ${data[court].title} com gols e alambrado`} loading="lazy" /><button className="view-3d" onClick={() => setViewer(court)}><Box size={16} />Explorar em 3D <ArrowUpRight size={15} /></button></div>
            <div className="field-info"><h3>{data[court].desc}</h3><div><span><Users size={16} />{data[court].players}</span><span><Goal size={16} />{data[court].size}</span></div><p>Modelos e medidas ilustrativos; não representam o levantamento das quadras reais.</p></div>
          </div>
          <aside id="reservas" className="scheduler pages-reserve" aria-labelledby="reserve-title">
            <div className="scheduler-head"><h3 id="reserve-title">Vamos marcar o jogo?</h3><CalendarDays size={24} /></div>
            <p className="pages-reserve-intro">Escolha a unidade e fale com a equipe para consultar horários, valores e disponibilidade.</p>
            <label className="unit-label" htmlFor="unit">Em qual unidade?</label>
            <select id="unit" value={unit} onChange={e => setUnit(Number(e.target.value))}>{units.map((u, i) => <option key={u.phone} value={i}>{u.name}</option>)}</select>
            <div className="unit-contact"><Phone size={18} /><span>{contact.display}<small>WhatsApp da unidade</small></span></div>
            <a className="button orange full" href={whatsapp} target="_blank" rel="noopener noreferrer">Consultar pelo WhatsApp <ArrowUpRight size={20} /></a>
            <a className="official-app" href={OFFICIAL_APP} target="_blank" rel="noopener noreferrer">Abrir o app de agendamentos <ArrowUpRight size={18} /></a>
            <p className="channel-note">Contatos e app indicados no Instagram da Mayer. A abertura do WhatsApp não confirma uma reserva.</p>
            <details className="preview-agenda"><summary>Conhecer a agenda do novo site</summary><p>O sistema que estamos desenvolvendo está em revisão privada e exige uma conta autorizada.</p><a href={`${BOOKING_ORIGIN}/#reservar`}>Abrir agenda em revisão <ArrowUpRight size={16} /></a><a href={`${BOOKING_ORIGIN}/#minhas-reservas`}>Minhas reservas na prévia <ArrowUpRight size={16} /></a></details>
          </aside>
        </div>
      </section>
      <section id="sobre" className="mayer-story container"><div><h2>Futebol e bons encontros.<br />Desde 1998.</h2><p>A Mayer Esportes reúne quadras, churrasqueiras e eventos. Um lugar para jogar e continuar o encontro com a sua turma.</p><a href="#reservas">Converse com a equipe sobre seu evento <ArrowUpRight size={19} /></a></div><div className="instagram-call"><Camera size={28} /><h3>Acompanhe a Mayer.</h3><p>Vídeos das quadras, novidades e informações no perfil oficial.</p><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">@mayeresportes <ArrowUpRight size={18} /></a></div></section>
      <section className="faq-section container"><h2>Antes do apito.</h2><div className="faq-list">
        <details><summary>Como reservar um horário?</summary><p>Escolha a unidade na seção de reservas e consulte a equipe pelo WhatsApp. O perfil oficial também disponibiliza um aplicativo para agendamentos.</p></details>
        <details><summary>Quais são os valores?</summary><p>Consulte o WhatsApp da unidade ou o destaque Valores no Instagram. Os preços oficiais ainda não foram informados para este site.</p><a href="https://www.instagram.com/stories/highlights/18186770695399361/" target="_blank" rel="noopener noreferrer">Ver destaque Valores <ArrowUpRight size={14} /></a></details>
        <details><summary>Onde ficam as unidades?</summary><p>Veja o destaque Localização no perfil oficial ou confirme o endereço com a equipe da unidade escolhida.</p><a href="https://www.instagram.com/stories/highlights/18104471186183267/" target="_blank" rel="noopener noreferrer">Ver destaque Localização <ArrowUpRight size={14} /></a></details>
        <details><summary>Também posso reservar para eventos?</summary><p>O perfil oficial divulga quadras, churrasqueiras e eventos. Converse com a unidade para confirmar a estrutura, as condições e a disponibilidade para sua turma.</p></details>
        <details><summary>Os modelos 3D são das quadras reais?</summary><p>São modelos ilustrativos de Fut5 e Fut7 criados para este projeto. As medidas não foram verificadas nas unidades.</p></details>
      </div></section>
      <section className="last-call container"><div><h2>Chame o time.<br /><span>O encontro é na Mayer.</span></h2><p>Seu futebol. Seu churrasco. Seu encontro.</p></div><a className="button orange" href="#reservas">Consultar um horário <ArrowUpRight size={23} /></a></section>
    </main>
    <footer className="footer container"><a className="brand" href="#inicio" aria-label="Mayer Esportes, voltar ao início"><Brand /></a><div><p>Desde 1998, o jogo acontece aqui.</p><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">@mayeresportes <ArrowUpRight size={14} /></a></div><div className="footer-links"><a href="#reservas">Contatos das unidades <ArrowUpRight size={14} /></a><a href={`${BOOKING_ORIGIN}/#gestao`}>Gestão do site em revisão <ArrowUpRight size={14} /></a><small>© {new Date().getFullYear()} Mayer Esportes · Site em desenvolvimento</small></div></footer>
    {viewer && <Dialog title={`Modelo ${viewer.toUpperCase()}`} wide onClose={() => setViewer(null)}><iframe className="model-frame" title={`Modelo interativo do campo ${viewer}`} src={`${asset('viewer.html')}?court=${viewer}`} /><p className="viewer-note">Arraste para girar. Use o zoom para explorar. Modelo ilustrativo.</p></Dialog>}
  </>;
}
