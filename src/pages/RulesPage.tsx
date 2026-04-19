import { useNavigate } from 'react-router-dom';

export default function RulesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 px-4 py-6 max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-slate-400 hover:text-white mb-6 min-h-[44px] px-2"
      >
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">Regras do Jogo</h1>

      <Section title="Objetivo do jogo">
        <p>
          Ser o último jogador com vidas restantes. Cada jogador começa com{' '}
          <strong className="text-white">5 vidas</strong>. Quem perder todas as vidas é eliminado. O jogo
          termina quando restar apenas um jogador.
        </p>
      </Section>

      <Section title="O baralho">
        <p>
          O jogo usa um baralho de <strong className="text-white">40 cartas</strong> — um baralho padrão
          sem os 8s, 9s e 10s.
        </p>
        <p className="mt-2">Os <strong className="text-white">valores</strong> das cartas, do mais fraco ao mais forte:</p>
        <div className="grid grid-cols-5 gap-1 mt-2 text-center font-mono">
          {(['4','5','6','7','Q','J','K','A','2','3'] as const).map(v => (
            <span key={v} className="bg-slate-700 rounded px-2 py-1 text-white font-bold">{v}</span>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">4 é a carta mais fraca. 3 é a mais forte (fora da manilha).</p>
        <p className="mt-2">
          Os <strong className="text-white">naipes</strong>: Paus (♣), Copas (♥), Espadas (♠), Ouros (♦).
        </p>
      </Section>

      <Section title="A manilha (carta curinga)">
        <p>
          A <strong className="text-white">manilha</strong> é a carta mais poderosa da rodada — bate
          qualquer outra carta. Ela é determinada pela <strong className="text-white">vira</strong>: uma
          carta virada antes de cada rodada. A manilha é o valor <em>seguinte</em> ao da vira na sequência
          de força.
        </p>
        <p className="mt-2">
          Exemplo: se a vira é o <strong className="text-white">4</strong>, a manilha é o{' '}
          <strong className="text-white">5</strong>. Se a vira é o <strong className="text-white">3</strong>,
          a manilha é o <strong className="text-white">4</strong> (volta ao início).
        </p>
        <p className="mt-2">
          Há <strong className="text-white">4 manilhas</strong> por rodada (uma de cada naipe). Quando duas
          manilhas se enfrentam, a hierarquia de naipes decide (da mais forte para a mais fraca):
        </p>
        <p className="mt-1 font-mono text-center bg-slate-700 rounded py-2 text-sm">
          ♣ Paus &gt; ♥ Copas &gt; ♠ Espadas &gt; ♦ Ouros
        </p>
        <p className="mt-1 text-xs text-slate-400">Exemplo: 5♣ bate 5♥, que bate 5♠, que bate 5♦.</p>
      </Section>

      <Section title="Rodadas e distribuição de cartas">
        <p>
          Na <strong className="text-white">rodada N</strong>, cada jogador recebe{' '}
          <strong className="text-white">N cartas</strong>. A partir de certa rodada, o número de cartas
          para de crescer porque o baralho não tem cartas suficientes para todos — o limite é{' '}
          <span className="font-mono bg-slate-700 px-1 rounded text-xs">floor(40 ÷ nº de jogadores)</span>.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Exemplo com 4 jogadores: o máximo é 10 cartas por jogador (40 ÷ 4). As rodadas 11, 12… usam 10
          cartas.
        </p>
      </Section>

      <Section title="O distribuidor">
        <p>
          O <strong className="text-white">distribuidor</strong> é um jogador designado a cada rodada.
          Ele distribui as cartas e é o <em>último</em> a fazer seu palpite. A cada nova rodada, a função
          passa para o próximo jogador vivo na ordem da mesa.
        </p>
      </Section>

      <Section title="Palpite (bid)">
        <p>
          Antes de jogar, cada jogador declara quantas{' '}
          <strong className="text-white">vazas</strong> acredita que vai vencer — isso é o{' '}
          <strong className="text-white">palpite</strong>.
        </p>
        <p className="mt-2">
          A ordem de palpites começa pelo jogador imediatamente após o distribuidor e segue em círculo. O
          distribuidor é o último a palitar. O palpite pode ser 0.
        </p>
      </Section>

      <Section title="Vaza (trick)">
        <p>
          Uma <strong className="text-white">vaza</strong> é uma rodada de cartas em que cada jogador joga
          uma carta. A carta mais forte vence a vaza. O número de vazas em cada rodada é igual ao número de
          cartas distribuídas.
        </p>
        <p className="mt-2">
          <strong className="text-white">Empate ("melou"):</strong> se dois jogadores jogam cartas do mesmo
          valor e nenhuma é manilha, ninguém vence aquela vaza — ela é descartada sem contar para ninguém.
        </p>
      </Section>

      <Section title="Cálculo de perda de vidas">
        <p>No final da rodada, compara-se o palpite com as vazas efetivamente ganhas:</p>
        <p className="mt-2 font-mono text-center bg-slate-700 rounded-lg py-3 text-white text-sm">
          Vidas perdidas = |palpite − vazas ganhas|
        </p>
        <p className="mt-2">Quem acertou o palpite exato não perde nenhuma vida.</p>
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex justify-between bg-slate-700 rounded px-3 py-1">
            <span>Palpitou 2, ganhou 2</span>
            <span className="text-green-400 font-semibold">0 vidas perdidas ✓</span>
          </div>
          <div className="flex justify-between bg-slate-700 rounded px-3 py-1">
            <span>Palpitou 2, ganhou 3</span>
            <span className="text-red-400 font-semibold">1 vida perdida</span>
          </div>
          <div className="flex justify-between bg-slate-700 rounded px-3 py-1">
            <span>Palpitou 2, ganhou 0</span>
            <span className="text-red-400 font-semibold">2 vidas perdidas</span>
          </div>
        </div>
      </Section>

      <Section title="Eliminação e vitória">
        <p>
          Um jogador é <strong className="text-white">eliminado</strong> quando suas vidas chegam a 0 ou
          menos. O jogo termina quando restar apenas um jogador —{' '}
          <strong className="text-white">esse é o vencedor</strong>.
        </p>
        <p className="mt-2">
          <strong className="text-white">Desempate:</strong> se dois ou mais jogadores são eliminados ao
          mesmo tempo, joga-se uma rodada extra entre eles. Quem perder mais vidas nessa rodada extra é
          eliminado. Se o empate persistir, pode-se declarar empate oficial.
        </p>
      </Section>

      <Section title="Modos do aplicativo">
        <p className="font-semibold text-white">🎮 Modo 1 — Suporte Geral</p>
        <p className="mt-1 text-xs">
          Usado pelo "mestre de jogo" ou árbitro da mesa. Gerencia todos os jogadores, rodadas, palpites e
          vidas. Ideal para quem controla o jogo completo.
        </p>
        <p className="font-semibold text-white mt-3">🤚 Modo 2 — Painel Individual</p>
        <p className="mt-1 text-xs">
          Usado por um jogador individualmente para acompanhar a própria mão, marcar cartas já jogadas e
          estimar quantas cartas ainda restam na mesa. Não controla o jogo todo.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4 bg-slate-800 rounded-xl p-4">
      <h2 className="text-white font-semibold text-sm mb-2 border-b border-slate-700 pb-1">{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}
