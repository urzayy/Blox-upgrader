const html = await fetch('https://bloxupgrader.com/').then((r) => r.text());
console.log(html.slice(0, 2500));
