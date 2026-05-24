fetch("data.json")
  .then(response => response.json())
  .then(data => {

    document.getElementById("title").textContent = data.title;
    document.getElementById("bio").textContent = data.bio;

    const linksDiv = document.getElementById("links");

    data.links.forEach(link => {
      const a = document.createElement("a");

      a.href = link.url;
      a.textContent = link.name;
      a.target = "_blank";

      linksDiv.appendChild(a);
    });

  });