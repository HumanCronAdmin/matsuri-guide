(() => {
  let festivals = [];
  const MONTH_NAME = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
  const CATEGORY_LABEL = {
    religious:"Religious",dance:"Dance",parade:"Parade",fireworks:"Fireworks",
    food:"Food",nature:"Nature",historical:"Historical",arts:"Arts"
  };
  const SEASON_LABEL = {spring:"Spring",summer:"Summer",autumn:"Autumn",winter:"Winter"};
  const REGION_LABEL = {
    hokkaido:"Hokkaido",tohoku:"Tohoku",kanto:"Kanto",chubu:"Chubu",
    kansai:"Kansai",chugoku:"Chugoku",shikoku:"Shikoku",kyushu:"Kyushu"
  };
  const SEASON_ICON = {spring:"\uD83C\uDF38",summer:"\u2600\uFE0F",autumn:"\uD83C\uDF41",winter:"\u2744\uFE0F"};
  const CROWD_LABEL = {low:"Low Crowds",moderate:"Moderate Crowds",high:"High Crowds",extreme:"Extreme Crowds"};

  const $ = id => document.getElementById(id);

  function populateFilters() {
    const cats = [...new Set(festivals.map(f => f.category))].sort();
    const seasons = [...new Set(festivals.map(f => f.season))].sort();
    const regions = [...new Set(festivals.map(f => f.region))].sort();

    cats.forEach(c => $("category").innerHTML += `<option value="${c}">${CATEGORY_LABEL[c]||c}</option>`);
    seasons.forEach(s => $("season").innerHTML += `<option value="${s}">${SEASON_LABEL[s]||s}</option>`);
    regions.forEach(r => $("region").innerHTML += `<option value="${r}">${REGION_LABEL[r]||r}</option>`);
  }

  function getFiltered() {
    const q = $("search").value.toLowerCase();
    const cat = $("category").value;
    const season = $("season").value;
    const region = $("region").value;
    const sort = $("sort").value;

    let list = festivals.filter(f => {
      if (cat && f.category !== cat) return false;
      if (season && f.season !== season) return false;
      if (region && f.region !== region) return false;
      if (q && !f.name.toLowerCase().includes(q) && !(f.name_ja||"").includes(q) && !f.prefecture.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sort === "month") list.sort((a, b) => a.month - b.month);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }

  function renderCard(f) {
    const seasonIcon = SEASON_ICON[f.season] || "";
    const highlightsHtml = (f.highlights||[]).map(h => `<li>${h}</li>`).join("");
    const crowdBadge = f.crowd_level ? `<span class="badge badge-crowd">${CROWD_LABEL[f.crowd_level]||f.crowd_level}</span>` : "";
    const priceBadge = f.price_range === "free" ? `<span class="badge badge-free">Free</span>` : `<span class="badge badge-paid">${f.price_range}</span>`;
    const tipHtml = f.travel_tip ? `<div class="travel-tip">${f.travel_tip}</div>` : "";
    const websiteHtml = f.website ? `<div class="station-link"><a href="${f.website}" target="_blank" rel="noopener">Official Website</a></div>` : "";
    const durationText = f.duration_days === 1 ? "1 day" : `${f.duration_days} days`;

    return `<div class="product-card">
      <div class="prefecture">${f.prefecture} \u00B7 ${f.city}</div>
      <h3>${f.name}</h3>
      <div class="name-ja">${f.name_ja||""}</div>
      <div class="badges">
        <span class="badge badge-cat">${CATEGORY_LABEL[f.category]||f.category}</span>
        <span class="badge badge-season">${seasonIcon} ${SEASON_LABEL[f.season]||f.season}</span>
        ${crowdBadge}
        ${priceBadge}
      </div>
      <div class="product-meta">
        <span>\uD83D\uDCC5 ${MONTH_NAME[f.month]}</span>
        <span>\u23F1 ${durationText}</span>
      </div>
      <div class="product-month">${MONTH_NAME[f.month]}</div>
      <ul class="product-highlights">${highlightsHtml}</ul>
      <div class="product-best"><strong>Best for:</strong> ${f.best_for}</div>
      ${tipHtml}
      <div class="station-link">\uD83D\uDE89 ${f.nearest_station}</div>
      ${websiteHtml}
    </div>`;
  }

  function render() {
    const list = getFiltered();
    $("resultCount").textContent = `${list.length} festival${list.length !== 1 ? "s" : ""} found`;
    $("grid").innerHTML = list.map(renderCard).join("");
  }

  function init() {
    fetch("data/products.json")
      .then(r => r.json())
      .then(data => {
        festivals = data;
        populateFilters();
        render();
      })
      .catch(err => {
        $("grid").innerHTML = `<p style="padding:24px;color:#78716C">Could not load festivals. ${err.message}</p>`;
      });

    ["search","category","season","region","sort"].forEach(id => {
      $(id).addEventListener(id === "search" ? "input" : "change", render);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
