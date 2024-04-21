import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import * as d3 from "d3";

function addNode(nodeId) {
    const nodeExists = graphData.nodes.some((node) => node.id === nodeId);
    if (!nodeExists) {
      graphData.nodes.push({ id: nodeId });
    }
  }

  function updateGraph() {
    const width = 300;
    const height = 150;
    d3.select("#graphContainer").selectAll("*").remove();
    const svg = d3
      .select("#graphContainer")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "red");

    const simulation = d3
      .forceSimulation(graphData.nodes)
      .force(
        "link",
        d3
          .forceLink(graphData.links)
          .id((d) => d.id)
          .distance(200)
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .selectAll(".link")
      .data(graphData.links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("marker-end", "url(#arrowhead)");

    const node = svg
      .selectAll(".node")
      .data(graphData.nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 12)
      .call(
        d3
          .drag()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      );

    const text = svg
      .selectAll(".text")
      .data(graphData.nodes)
      .enter()
      .append("text")
      .attr("class", "text")
      .text((d) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => Math.max(12, Math.min(width - 12, d.source.x)))
        .attr("y1", (d) => Math.max(12, Math.min(height - 12, d.source.y)))
        .attr("x2", (d) => Math.max(12, Math.min(width - 12, d.target.x)))
        .attr("y2", (d) => Math.max(12, Math.min(height - 12, d.target.y)));

      node
        .attr("cx", (d) => Math.max(12, Math.min(width - 12, d.x))) // Constrain node positions within SVG bounds
        .attr("cy", (d) => Math.max(12, Math.min(height - 12, d.y)));

      text
        .attr("x", (d) => Math.max(12, Math.min(width - 12, d.x))) // Align text position with nodes
        .attr("y", (d) => Math.max(12, Math.min(height - 12, d.y)));
    });

    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
      simulation.alpha(0.1).restart();
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = event.x;
      d.fy = event.y;
    }
  }

  function addEdges() {
    console.log({ inputEdges });
    const edges = inputEdges.split("\n");
    edges.forEach((edge) => {
      const [node1, node2] = edge.trim().split(" ");
      if (node1 && node2) {
        addNode(node1);
        addNode(node2);
        setGraphData((prevData) => ({
          nodes: prevData.nodes,
          links: [...prevData.links, { source: node1, target: node2 }],
        }));
      }
    });
    updateGraph();
    handleCreateGraph();
  }

  function showNodes() {
    const nodesList = graphData.nodes.map((node) => node.id).join(", ");
    const nodeCount = graphData.nodes.length;
    document.getElementById(
      "outputArea"
    ).innerHTML = `Nodes (${nodeCount}): ${nodesList}`;
  }

  function showEdges() {
    const uniqueEdges = new Set();
    graphData.links.forEach((link) => {
      uniqueEdges.add(`${link.source.id} >> ${link.target.id}`);
    });
    const edgesList = Array.from(uniqueEdges).join("<br>");
    const edgeCount = uniqueEdges.size; // Calculate number of unique edges
    document.getElementById(
      "outputArea"
    ).innerHTML = `Edges (${edgeCount}):<br>${edgesList}`;
  }

  function showEdgePairs() {
    const pairs = new Set();
    graphData.links.forEach((link) => {
      let targetIndex = graphData.links.findIndex(
        (l) => l.source.id === link.target.id
      );
      if (targetIndex !== -1) {
        pairs.add(
          `${link.source.id}, ${link.target.id}, ${graphData.links[targetIndex].target.id}`
        );
      } else {
        pairs.add(`${link.source.id}, ${link.target.id}`);
      }
    });
    const pairsList = Array.from(pairs).join("<br>");
    const pairCount = pairs.size;
    document.getElementById(
      "outputArea"
    ).innerHTML = `Edge Pairs (${pairCount}):<br>${pairsList}`;
  }

  function findEdgeCoveragePaths() {
    const initialNode = document.getElementById("initialNode").value.trim();
    const finalNode = document.getElementById("finalNode").value.trim();

    if (!initialNode || !finalNode) {
      console.error("Initial or final node value missing.");
      alert("Please enter the initial and final nodes.");
      return;
    }

    let paths = [];
    let queue = [{ path: [initialNode], edgeVisits: new Map() }];
    let allEdges = new Set(
      graphData.links.map((link) => `${link.source.id}>>${link.target.id}`)
    );

    console.log(
      `Starting Edge Coverage Calculation from '${initialNode}' to '${finalNode}'.`
    );
    console.log(`Total edges to cover: ${allEdges.size}`);

    while (queue.length > 0) {
      let current = queue.shift();
      let currentPath = current.path;
      let edgeVisits = current.edgeVisits;
      let lastNode = currentPath[currentPath.length - 1];

      console.log(
        `Exploring from node '${lastNode}' on path: ${currentPath.join(" -> ")}`
      );

      if (lastNode === finalNode) {
        console.log(
          `Path ends at final node '${finalNode}': ${currentPath.join(" -> ")}`
        );
        paths.push(currentPath);
        continue;
      }

      graphData.links.forEach((link) => {
        if (link.source.id === lastNode) {
          let edgeKey = `${link.source.id}>>${link.target.id}`;
          let visits = edgeVisits.get(edgeKey) || 0;

          if (visits < 2) {
            let newPath = currentPath.concat([link.target.id]);
            let newEdgeVisits = new Map(edgeVisits);
            newEdgeVisits.set(edgeKey, visits + 1);

            console.log(
              `Continuing to node '${link.target.id}' via edge '${edgeKey}' (${
                visits + 1
              } visits)`
            );
            queue.push({ path: newPath, edgeVisits: newEdgeVisits });
          } else {
            console.log(
              `Skipping edge '${edgeKey}' from '${link.source.id}' to '${link.target.id}' (already visited 2 times)`
            );
          }
        }
      });
    }

    if (areAllEdgesCovered(paths, allEdges)) {
      console.log("All edges are covered by the found paths.");
      displayPaths(paths);
    } else {
      console.log("Failed to cover all edges. Some edges remain uncovered.");
      document.getElementById("testPaths").innerHTML =
        "Not all edges could be covered within the given constraints.";
    }
  }

  function areAllEdgesCovered(paths, allEdges) {
    let coveredEdges = new Set();
    paths.forEach((path) => {
      for (let i = 0; i < path.length - 1; i++) {
        coveredEdges.add(`${path[i]}>>${path[i + 1]}`);
      }
    });
    console.log(`Edges covered: ${coveredEdges.size}/${allEdges.size}`);
    return coveredEdges.size === allEdges.size;
  }

  function displayPaths(paths) {
    let pathsStr = paths
      .map((path) => `<div>${path.join(" -> ")}</div>`)
      .join("");
    document.getElementById(
      "testPaths"
    ).innerHTML = `Edge Coverage Paths:<br>${pathsStr}`;
    console.log("Displaying edge coverage paths on the page.");
  }

  function findTestPaths() {
    const initialNode = document.getElementById("initialNode").value.trim();
    const finalNode = document.getElementById("finalNode").value.trim();

    if (!initialNode || !finalNode) {
      console.error("Initial or final node value missing.");
      alert("Please enter both initial and final nodes.");
      return;
    }

    console.log(`Starting Node Coverage Calculation from '${initialNode}' to '${finalNode}'`);

    let paths = [];
    let queue = [
      { path: [initialNode], visitCount: new Map([[initialNode, 1]]) },
    ];
    let allNodes = new Set(graphData.nodes.map((node) => node.id));

    console.log(`Total nodes in graph: ${allNodes.size}. Starting exploration.`);

    while (queue.length > 0) {
      let current = queue.shift();
      let path = current.path;
      let visitCount = current.visitCount;
      let lastNode = path[path.length - 1];

      console.log(`Exploring path: ${path.join(" >> ")}.`);

      if (visitCount.get(lastNode) > 2) {
        console.log(
          `Discarding path as node '${lastNode}' was visited more than twice: ${path.join(
            " >> "
          )}`
        );
        continue;
      }

      if (lastNode === finalNode) {
        console.log(`Reached final node: ${finalNode}.`);
        paths.push(path);
      }

      let nextSteps = graphData.links.filter(
        (link) => link.source.id === lastNode
      );

      nextSteps.forEach((link) => {
        let currentVisits = visitCount.get(link.target.id) || 0;
        if (currentVisits < 2) {
          let newPath = [...path, link.target.id];
          let newVisitCount = new Map(visitCount);
          newVisitCount.set(link.target.id, currentVisits + 1);
          queue.push({ path: newPath, visitCount: newVisitCount });
          console.log(`Continuing path to ${link.target.id} from ${lastNode}.`);
        } else {
          console.log(
            `Avoiding path to ${link.target.id} from ${lastNode} due to visit limit.`
          );
        }
      });
    }

    console.log(`Exploration complete. Total paths found: ${paths.length}`);
    selectAndDisplayPaths(paths, allNodes);
  }

  function selectAndDisplayPaths(paths, allNodes) {
    let selectedPaths = selectPaths(paths, allNodes);
    let pathsStr = selectedPaths
      .map((path) => `<div>${path.join(" >> ")}</div>`)
      .join("");
    document.getElementById(
      "testPaths"
    ).innerHTML = `Selected Paths:<br>${pathsStr}`;
    console.log("Displaying selected paths on the page.");
  }

  function selectPaths(paths, allNodes) {
    let nodeCoverage = new Set();
    let pathScores = paths.map((path) => {
      let uniqueNodes = new Set(path);
      let redundancy = path.length - uniqueNodes.size;
      return {
        path,
        score: uniqueNodes.size - redundancy,
        length: path.length,
      };
    });

    pathScores.sort((a, b) => b.score - a.score || b.length - a.length);

    let selectedPaths = [];
    for (let ps of pathScores) {
      selectedPaths.push(ps.path);
      ps.path.forEach((node) => nodeCoverage.add(node));
      if (nodeCoverage.size === allNodes.size) break;
    }

    return selectedPaths.filter((path) => {
      return new Set(path).size > 1;
    });
  }

  const handleCreateGraph = async () => {
    const token = localStorage.getItem("token");
    const user = jwtDecode(token);

    const pairs = inputEdges
      .split("\n")
      .map((pair) => pair.split(" ").map((num) => parseInt(num)));

    try {
      const response = await axios.post(
        "http://localhost:5000/pair/new-pair",
        {
          username: user?.username,
          pairs: pairs,
          name: graphName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      if (response) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.warning(error.response.data.message);
      console.error("Error logging in:", error.response.data.message);
    }
  };
