// Hogwarts theme: post cards are rifts torn in the Marauder's Map. A wand-light
// follows the pointer across a rift (hogwarts.css draws it from --mx and --my)
// and sheds golden sparks. Does nothing under any other theme.

const SPARK_GAP = 45; // ms between sparks

function shedSpark(card, x, y) {
  const spark = document.createElement('span');
  spark.className = 'rift-spark';
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  spark.style.setProperty('--size', `${5 + Math.random() * 6}px`);
  spark.style.setProperty('--dx', `${(Math.random() - 0.5) * 40}px`);
  spark.style.setProperty('--dy', `${-20 - Math.random() * 40}px`);
  spark.addEventListener('animationend', () => spark.remove());
  card.append(spark);
}

export function handleRiftMagic() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastSpark = 0;

  // Delegated, so cards added by infinite scroll are enchanted too.
  document.addEventListener('pointermove', (e) => {
    if (document.documentElement.getAttribute('data-theme') !== 'hogwarts') return;
    const card = e.target.closest?.('.post-item');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);

    if (reduceMotion || e.timeStamp - lastSpark < SPARK_GAP) return;
    lastSpark = e.timeStamp;
    shedSpark(card, x, y);
  });
}
