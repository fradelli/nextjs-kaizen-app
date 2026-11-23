// Renderizador Markdown mínimo da visualização do roadmap, sem dependências e sem rede.
// Cobre o que os documentos do Kaizen usam: títulos, parágrafos, listas (com checklist),
// tabelas, citações, código, regras horizontais, links, negrito, itálico e código inline.
// HTML do documento é sempre escapado; comentários HTML são omitidos.
(function (global) {
  "use strict";

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slug(text) {
    return String(text)
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .replace(/[`*_[\]()]/g, "")
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-");
  }

  function inline(text, options) {
    const codes = [];
    let html = escapeHtml(text).replace(/`([^`]+)`/g, function (_, code) {
      codes.push("<code>" + code + "</code>");
      return "\u0000" + (codes.length - 1) + "\u0000";
    });

    html = html.replace(/!?\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, function (_, label, href) {
      const target = options.resolveLink ? options.resolveLink(href.replace(/&amp;/g, "&")) : { href: href };
      const attributes = target.external ? ' target="_blank" rel="noopener"' : "";
      const className = target.className ? ' class="' + target.className + '"' : "";
      return '<a href="' + escapeHtml(target.href) + '"' + className + attributes + ">" + label + "</a>";
    });
    html = html
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^\w*])\*([^*\s][^*]*)\*(?!\w)/g, "$1<em>$2</em>")
      .replace(/(^|[^\w])_([^_\s][^_]*)_(?!\w)/g, "$1<em>$2</em>");

    return html.replace(/\u0000(\d+)\u0000/g, function (_, index) {
      return codes[Number(index)];
    });
  }

  function isTableSeparator(line) {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line);
  }

  function cells(line) {
    return line
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map(function (cell) {
        return cell.trim();
      });
  }

  function renderList(lines, options) {
    // lines: [{ indent, ordered, text }]
    let html = "";
    const stack = [];

    function open(item) {
      const tag = item.ordered ? "ol" : "ul";
      stack.push({ indent: item.indent, tag: tag });
      html += "<" + tag + ">";
    }

    lines.forEach(function (item) {
      if (!stack.length) {
        open(item);
      } else if (item.indent > stack[stack.length - 1].indent) {
        html = html.replace(/<\/li>$/, "");
        open(item);
      } else {
        while (stack.length > 1 && item.indent < stack[stack.length - 1].indent) {
          html += "</" + stack.pop().tag + "></li>";
        }
      }

      const task = item.text.match(/^\[([ xX])\]\s+(.*)$/);
      if (task) {
        const checked = task[1] !== " ";
        html +=
          '<li class="md-task' +
          (checked ? " done" : "") +
          '"><span class="md-check" aria-hidden="true">' +
          (checked ? "✓" : "") +
          '</span><span class="sr-only">' +
          (checked ? "Concluído: " : "Pendente: ") +
          "</span>" +
          inline(task[2], options) +
          "</li>";
      } else {
        html += "<li>" + inline(item.text, options) + "</li>";
      }
    });

    while (stack.length) {
      html += "</" + stack.pop().tag + ">" + (stack.length ? "</li>" : "");
    }

    return html;
  }

  function render(markdown, options) {
    options = options || {};
    const source = String(markdown || "")
      .replace(/\r\n?/g, "\n")
      .replace(/<!--[\s\S]*?-->/g, "");
    const lines = source.split("\n");
    const headings = [];
    const used = {};
    let html = "";
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];

      if (/^\s*$/.test(line)) {
        index++;
        continue;
      }

      const fence = line.match(/^\s*(```|~~~)\s*([\w-]*)/);
      if (fence) {
        const body = [];
        index++;
        while (index < lines.length && !lines[index].trim().startsWith(fence[1])) {
          body.push(lines[index]);
          index++;
        }
        index++;
        html +=
          '<pre class="md-code"' +
          (fence[2] ? ' data-lang="' + escapeHtml(fence[2]) + '"' : "") +
          "><code>" +
          escapeHtml(body.join("\n")) +
          "</code></pre>";
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (heading) {
        const level = heading[1].length;
        let id = slug(heading[2]) || "secao";
        if (used[id]) {
          used[id]++;
          id += "-" + used[id];
        } else {
          used[id] = 1;
        }
        headings.push({ id: id, level: level, text: heading[2].replace(/[`*]/g, "") });
        html += "<h" + level + ' id="' + escapeHtml(id) + '">' + inline(heading[2], options) + "</h" + level + ">";
        index++;
        continue;
      }

      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
        html += "<hr>";
        index++;
        continue;
      }

      if (/^\s*>/.test(line)) {
        const quote = [];
        while (index < lines.length && /^\s*>/.test(lines[index])) {
          quote.push(lines[index].replace(/^\s*>\s?/, ""));
          index++;
        }
        html += "<blockquote>" + render(quote.join("\n"), options).html + "</blockquote>";
        continue;
      }

      if (line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
        const head = cells(line);
        index += 2;
        let table = '<div class="md-table"><table><thead><tr>';
        head.forEach(function (cell) {
          table += "<th>" + inline(cell, options) + "</th>";
        });
        table += "</tr></thead><tbody>";
        while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
          table += "<tr>";
          cells(lines[index]).forEach(function (cell) {
            table += "<td>" + inline(cell, options) + "</td>";
          });
          table += "</tr>";
          index++;
        }
        html += table + "</tbody></table></div>";
        continue;
      }

      if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
        const items = [];
        while (index < lines.length) {
          const current = lines[index];
          const item = current.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
          if (item) {
            items.push({ indent: item[1].length, ordered: /\d/.test(item[2]), text: item[3] });
            index++;
          } else if (items.length && /^\s{2,}\S/.test(current) && !/^\s*([-*+]|\d+[.)])\s+/.test(current)) {
            items[items.length - 1].text += " " + current.trim();
            index++;
          } else {
            break;
          }
        }
        html += renderList(items, options);
        continue;
      }

      const paragraph = [];
      while (
        index < lines.length &&
        lines[index].trim() &&
        !/^(#{1,6}\s|\s*(```|~~~)|\s*>|\s*([-*+]|\d+[.)])\s+)/.test(lines[index]) &&
        !(lines[index].includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1]))
      ) {
        paragraph.push(lines[index].trim());
        index++;
      }
      if (!paragraph.length) {
        // Linha que nenhum bloco reconheceu: vira parágrafo próprio, sem travar a leitura.
        paragraph.push(lines[index].trim());
        index++;
      }
      html += "<p>" + inline(paragraph.join(" "), options) + "</p>";
    }

    return { headings: headings, html: html };
  }

  global.KaizenMarkdown = { escapeHtml: escapeHtml, render: render, slug: slug };
})(typeof window !== "undefined" ? window : globalThis);
