import { createSignal } from '@jacksonotto/pulse';

const Comp = () => {
  const [parts, setParts] = createSignal<string[]>([]);
  const words = [
    'word',
    'cheese',
    'writing',
    'like',
    'food',
    'party',
    'friday',
    'bro',
    'lego',
    'bomboclart',
    '\n',
    'true',
    'false',
    '[',
    ']',
    '{',
    '}',
    '@',
    '*',
    '&',
    '%',
    '(',
    ')',
    '<',
    '>',
    '~',
    '$',
    '#',
    '!'
  ];
  const len = 500;
  const str = Array(len)
    .fill('')
    .map(() => words[Math.floor(Math.random() * words.length)])
    .join(' ');
  const timeout = 60;

  (function doPart() {
    const allParts = str.split(' ').slice(parts().length);

    if (allParts.length === 0) return;

    setTimeout(() => {
      setParts((parts) => [...parts, allParts[0]]);

      doPart();
    }, timeout);
  })();

  return (
    <div>
      {parts().map((item) => (
        <>{item === '\n' ? <br /> : <span>{item} </span>}</>
      ))}
    </div>
  );
};

export default Comp;
