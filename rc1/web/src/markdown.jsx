function inline(text, keyPrefix) {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const nodes = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${index++}`;
    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else {
      const link = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      const href = link?.[2] || '';
      if (link && /^(https?:\/\/|\/)/.test(href)) {
        nodes.push(
          <a key={key} href={href} rel="noreferrer">
            {link[1]}
          </a>
        );
      } else {
        nodes.push(link ? link[1] : token);
      }
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function parseTable(lines) {
  const rows = lines
    .filter((line) => !/^\s*\|?\s*-{3,}/.test(line.replaceAll('|', '')))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
  if (rows.length < 2) return null;
  return { head: rows[0], body: rows.slice(1) };
}

export function Markdown({ source }) {
  const lines = String(source || '').replaceAll('\r\n', '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(<pre key={blocks.length}><code>{code.join('\n')}</code></pre>);
      continue;
    }
    if (line.startsWith('|')) {
      const tableLines = [];
      while (index < lines.length && lines[index].startsWith('|')) {
        tableLines.push(lines[index]);
        index += 1;
      }
      const table = parseTable(tableLines);
      if (!table) continue;
      blocks.push(
        <div className="table-wrap" key={blocks.length}>
          <table>
            <thead>
              <tr>{table.head.map((cell) => <th key={cell}>{inline(cell, cell)}</th>)}</tr>
            </thead>
            <tbody>
              {table.body.map((row) => (
                <tr key={row.join('-')}>
                  {row.map((cell) => <td key={cell}>{inline(cell, cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={blocks.length} />);
      index += 1;
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const Tag = `h${level + 1}`;
      blocks.push(<Tag key={blocks.length}>{inline(heading[2], heading[2])}</Tag>);
      index += 1;
      continue;
    }
    if (line.startsWith('> ')) {
      const quote = [];
      while (index < lines.length && lines[index].startsWith('> ')) {
        quote.push(lines[index].slice(2));
        index += 1;
      }
      blocks.push(<blockquote key={blocks.length}>{inline(quote.join(' '), 'q')}</blockquote>);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ul key={blocks.length}>
          {items.map((item) => <li key={item}>{inline(item, item)}</li>)}
        </ul>
      );
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={blocks.length}>
          {items.map((item) => <li key={item}>{inline(item, item)}</li>)}
        </ol>
      );
      continue;
    }
    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !/^(#{1,3}\s|```|> |[-*]\s|\d+\.\s|\|)/.test(lines[index]) && !/^---+$/.test(lines[index].trim())) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(<p key={blocks.length}>{inline(paragraph.join(' '), `p${blocks.length}`)}</p>);
  }

  return <div className="markdown">{blocks}</div>;
}
