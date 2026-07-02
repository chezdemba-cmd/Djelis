const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');
css = css.replace(/url\(['"]?assets\//g, "url('/assets/");
fs.writeFileSync('src/app/globals.css', css);
console.log("CSS updated!");
