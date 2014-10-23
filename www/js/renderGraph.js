/* Función para generar el grafo ------------------------------------------- */
function enterForce(w, h, nodes, lin, directed, colorNodes, colorArcs, bgimg) {
  
  // Configuración para SVG
  var width = w,
    height = h;
  
  // Configuración en base a datos de entrada
  var nodesRadius = 25 - nodes.length * 0.5,
    nodeWidth = 2,
    arcWidth = 2,
    nodesFont = nodesRadius * 0.6,
    nodesDist = nodesRadius * 10,
    graphCharge = -200,
    graphFriction = 0.9;
  
  /* SVG --------------------------- */
  // Borrar SVG y grafo anterior si lo hubiese
  var svg = d3.select('.shiny-network-output').select(".network-svg");   
    svg.remove();      
  // Crear un nuevo SVG
  svg = d3.select('.shiny-network-output').append("svg");
  // Con el tamaño marcado
  svg.attr("width", width)
    .attr("height", height)
    .attr("class", "network-svg")
    .attr("id", "maingraph");
    
  var imgs = svg.selectAll("img").data([0]);
    imgs.enter()
      .append("svg:image")
      .attr("xlink:href", bgimg)
      .attr("x", "0")
      .attr("y", "0")
      .attr("width", width)
      .attr("height", height);

  // Establecer force layout
  var force = d3.layout.force()
    .nodes(nodes)
    .links(lin)
    .charge(graphCharge)
    .linkDistance(nodesDist)        
    .size([width, height])
    .friction(graphFriction)
    .start();
  
  // Recuperar arcos y nodos
  var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");
  
  // Declaración necesaria para mover los nodos
  var drag = force.drag()
    .on("dragstart", dragstart);
     
  /* Flechas ----------------------- */
  var marker = svg.append("svg:defs").selectAll("marker")
    .data(lin)
    .enter().append("svg:marker")    
      .attr("id", function (d, i) { return 'marker_' + i })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", nodesRadius + nodesRadius / 2)  // lejanía respecto al centro del nodo siguiendo el arco
      .attr("refY", -1.5)  // lejanía respecto al centro del nodo eje Y
      .attr("markerWidth", nodesRadius / 3)  // ancho de la caja que contiene la flecha
      .attr("markerHeight", nodesRadius / 3)  // alto de la caja que contiene la flecha
      .attr("orient", "auto")
      .append("svg:path")
        .attr("id", function (d, i) { return 'pathmarker_' + i })
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", function (d, i) { 
          if (colorArcs[i] == 1) { return "red" }
          else if (colorArcs[i] == 2) { return "blue" }
          else if (colorArcs[i] == 8) { return "gray" }
          else if (colorArcs[i] == 9) { return "white" }
          else { return "black" }
        });
        
  /* Arcos ------------------------- */
  // Creamos primero los arcos para dibujar nodos sobre ellos
  link = link.data(lin)
    .enter().append("line")
      .attr("class", "link")
      .attr("id", function (d, i) { return "link" + i })
      .attr("stroke-width", arcWidth)
      .attr("stroke", "black")
      .attr("opacity", 0);
    
  // Creamos arcos artificiales para colocar sobre ellos las etiquetas
  var linkpaths = svg.selectAll(".linkpath")
    .data(lin)
    .enter().append("path")
      .attr({'d': function (d) { return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y },
              'class': 'linkpath',
              'opacity': function (d, i) {
                if (colorArcs[i] == 9) { return 0 }
                else { return 1 }},
              'stroke-width': arcWidth,
              'stroke': function (d, i) {
                if (colorArcs[i] == 1) { return "red" }
                else if (colorArcs[i] == 2) { return "blue" }
                else if (colorArcs[i] == 8) { return "gray" }
                else if (colorArcs[i] == 9) { return "white" }
                else { return "black" }},
              'id': function(d, i) { return 'linkpath' + i } })
      .style("pointer-events", "none");
      
    // Dibujamos flecha si los arcos son dirigidos
    if (directed) {
      linkpaths.attr("marker-end", function (d, i) {
        return 'url(#marker_' + i + ')'
        });
    }
        
  // Añadimos etiquetas de texto a estos arcos
  var linklabels = svg.selectAll(".linklabel")
    .data(lin)
    .enter().append("text")
      .style("pointer-events", "none")
      .attr({'class': 'linklabel',
        'id': function (d, i) { return 'linklabel' + i },
        'dy': -10,
        'font-size': nodesFont,
        'fill': '#000',
        'opacity': function (d, i) { 
          if (colorArcs[i] == 9) { return 0 }
          else if (nodes.length <= 25) { return 1 }
          else { return 0 }
          },                
        });
  // Las etiquetas son el peso de cada arco
  linklabels.append("textPath")
    .attr('xlink:href', function (d, i) { return '#linkpath' + i })
    .style("pointer-events", "none")
    .text(function (d, i) { return d.weight });

  /* Nodos ------------------------- */
  // Dibujar solo los nodos
  var node = svg.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("id", function (d, i) { return "node" + i })
      .attr("r", nodesRadius)
      .attr({ "fill": function (d, i) {
        if (nodes.length <= 25) { return "white" }
        else { return "white" }
        },
        "opacity": function (d, i) {
          if (colorNodes[i] == 9) { return 0 }
          else { return 1 } },
        "stroke": function (d, i) {
          if (colorNodes[i] == 1) { return "red" }
          else if (colorNodes[i] == 2) { return "blue" }
          else if (colorNodes[i] == 8) { return "gray" }
          else if (colorNodes[i] == 9) { return "white" }
          else { return "black" } },
	      "stroke-width": nodeWidth})
      .on("dblclick", dblclick)
      .call(drag);
  // Añadir etiquetas a los nodos
  var nodelabels = svg.selectAll(".nodelabel")
    .data(nodes)
    .enter().append("text")
      .attr("class", "nodelabel")
      .attr("id", function (d, i) { return "nodelabel" + i })
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "middle")
      .attr({ "x": function (d) { return d.x; },
              "y": function (d) { return d.y; },
              "stroke": "black",
              "opacity": function (d, i) {
                if (colorNodes[i] == 9) { return 0 }
                else if (nodes.length <= 25) { return 1 }
                else { return 0 }
                },
              "font-size": nodesFont } )
      .text(function(d) { return d.name; });
  // TODO: Evitar que se solapen las etiquetas
        
  /* Función tick de arranque ---------------------------------------------- */
  force.on("tick", function() {
      
    // Nodos
    node.attr("cx", function (d) { return d.x = Math.max(nodesRadius + 3, Math.min(width - nodesRadius - 3, d.x)); })
      .attr("cy", function (d) { return d.y = Math.max(nodesRadius + 3, Math.min(height - nodesRadius - 3, d.y)); } );
    // Etiquetas de los nodos
    nodelabels.attr("x", function(d) { return d.x; }) 
      .attr("y", function(d) { return d.y; });
      
    // Calcular diferente representación segun arcos dirigidos o no 
    if (!directed) {
      // Arcos rectos en grafos no dirigidos
      link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
      // Arcos auxiliares para las etiquetas
      linkpaths.attr('d', function(d) { 
        var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        return path
      });
          
    } else {
      // Arcos con líneas curvas para grafos dirigidos
      linkpaths.attr('d', function(d) { 
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + 
            d.source.x + "," + 
            d.source.y + "A" + 
            dr + "," + dr + " 0 0,1 " + 
            d.target.x + "," + 
            d.target.y;
      });
        
    }
      
    // Etiquetas de los arcos
    linklabels.attr('transform', function(d, i) {
      if (d.target.x < d.source.x) {
        bbox = this.getBBox();
        rx = bbox.x + bbox.width/2;
        ry = bbox.y + bbox.height/2;
        return 'rotate(180 ' + rx + ' ' + ry + ')';
      } else {
        return 'rotate(0)';
      }
    })
      .attr('dx', function (d) {
        return Math.sqrt(Math.pow(d.target.x - d.source.x, 2) +  Math.pow(d.target.y - d.source.y, 2))/2 - 10
    });
      
  });
  /* ----------------------------------------------------------------------- */
  
  /*
  var info = svg.append("svg:text")
    .attr("x", width - 120)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font", "12px Helvetica Neue")
    .attr("id", "info")
    .text("Estado inicial");
    */

  /* Funciones para el comportamiento de los nodos ------------------------- */
  // Función para fijar los nodos seleccionados
  function dragstart(d) {
    d3.select(this).classed("fixed", d.fixed = true);
  }
  // Función para liberar nodo fijado
  function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
  }
  /* ----------------------------------------------------------------------- */
  
};
/* ------------------------------------------------------------------------- */

/* Función para marcar el árbol -------------------------------------------- */
function updateForce(nodes, arcs, directed) {
  
    var nodesLength = nodes.length;
    var nodesColor = new Array;
    var nodesOpacity = new Array;
    // Determinar colores
    for (var i=0; i < nodesLength; i++) {
      if (nodes[i] == 1) {
        nodesColor.push("red");
        nodesOpacity.push(1);
      } else if (nodes[i] == 2) {
        nodesColor.push("blue");
        nodesOpacity.push(1);
      } else if (nodes[i] == 8) {
        nodesColor.push("gray");
        nodesOpacity.push(0.5);
      } else if (nodes[i] == 9) {
        nodesColor.push("white");
        nodesOpacity.push(0);
      } else {
        nodesColor.push("black");
        nodesOpacity.push(1);
      }
    }
    
    // Modificar nodos
    for (var i=0; i < nodesLength; i++) {
      d3.select('#node' + i)
        .attr('stroke', nodesColor[i])
        .attr('opacity', nodesOpacity[i]);
      if (nodes.length <= 25) {    
        d3.select('#nodelabel' + i)
          .attr('opacity', nodesOpacity[i]);
      } else {
        d3.select('#nodelabel' + i)
          .attr('opacity', 0);
      }
    };
    
    var treeLength = arcs.length;
    var arcsColor = new Array;
    var arcsOpacity = new Array;
    // Determinar colores
    for (var i=0; i < treeLength; i++) {
      if (arcs[i] == 1) {
        arcsColor.push("red");
        arcsOpacity.push(1);
      } else if (arcs[i] == 2) {
        arcsColor.push("blue");
        arcsOpacity.push(1);
      } else if (arcs[i] == 8) {
        arcsColor.push("gray");
        arcsOpacity.push(0.5);
      } else if (arcs[i] == 9) {
        arcsColor.push("white");
        arcsOpacity.push(0);
      } else {
        arcsColor.push("black");
        arcsOpacity.push(1);
      }
    }
    // Modifica los enlaces entre determinados arcos
    if (directed) {
      for (var i=0; i < treeLength; i++) {
        d3.select('#pathmarker_' + i)
            .attr('fill', arcsColor[i])
            .attr('opacity', arcsOpacity[i]);
        d3.select('#linkpath' + i)
            .attr('stroke', arcsColor[i])
            .attr('opacity', arcsOpacity[i])
            .attr('marker-end', 'url(#marker_' + i + ')');
        if (nodes.length <= 25) {
          d3.select('#linklabel' + i)
              .attr('opacity', arcsOpacity[i]);
        } else {
          d3.select('#linklabel' + i)
              .attr('opacity', 0);
        }
        };
    } else {
      for (var i=0; i < treeLength; i++) {
        d3.select('#pathmarker_' + i)
            .attr('fill', arcsColor[i])
            .attr('opacity', arcsOpacity[i]);
        d3.select('#linkpath' + i)
            .attr('stroke', arcsColor[i])
            .attr('opacity', arcsOpacity[i]);
        if (nodes.length <= 25) {
          d3.select('#linklabel' + i)
              .attr('opacity', arcsOpacity[i]);
        } else {
          d3.select('#linklabel' + i)
              .attr('opacity', 0);
        }
      };
    };

};
/* ------------------------------------------------------------------------- */

/* Función para mostrar información ---------------------------------------- */
function infoGraph() {
  var info = svg.append("svg:text")
    .attr("x", 480)
    .attr("y", 250)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .style("font", "300 128px Helvetica Neue")
    .text("Hello, getBBox!");
}
/* ------------------------------------------------------------------------- */

/* Parte actualizable mediante Shiny --------------------------------------- */
// Crea el elemento como salida de Shiny
var networkOutputBinding = new Shiny.OutputBinding();
  $.extend(networkOutputBinding, {
    // Busca el id a actualizar
    find: function(scope) {
      return $(scope).find('.shiny-network-output');
    },
    // Empieza la parte de utilización de los datos para usar en D3
    renderValue: function(el, data) {
      
      // data contiene los datos para la representación
      // newGraph, width, height, names, links, directed, graphOK, colorNodes, colorArcs
      
      // Detectamos si es un grafo nuevo o no
      var newGraph = data.newGraph;
      
      if (newGraph == 1) {  // Si es nuevo dibujamos el grafo
      
        // Tamaño SVG
        var w = data.width,
          h = data.height;
        
        // Fondo
        var bgimg = data.bgimg;
          
        // Conseguir datos de los nodos y arcos
        var nodes = new Array();
        for (var i = 0; i < data.names.length; i++) {
          nodes.push({ "name": data.names[i], "x": data.xcoord[i], "y": data.ycoord[i], "fixed": data.fixed[i] });
        };

        var lin = data.links;
        
        // Nodos y arcs marcados
        var colorNodes = new Array();  // necesario array
        if (!isNaN(data.colorNodes)) {  // comprobar si es un único número
          colorNodes.push(data.colorNodes);
        } else {
          colorNodes = data.colorNodes;
        };
        
        var colorArcs = new Array();  // necesario array
        if (!isNaN(data.colorArcs)) {  // comprobar si es un único número
          colorArcs.push(data.colorArcs);
        } else {
          colorArcs = data.colorArcs;
        };
        
        // Generar el grafo
        enterForce(w, h, nodes, lin, data.directed, colorNodes[0], colorArcs[0], bgimg);
        // Si hay más de una etapa
        if (data.stages > 1) {
          var maxLoops = data.stages - 1;
          var counter = 0;
          (function next() {
              if (counter++ >= maxLoops) return;
              setTimeout(function() {
                  // Marcar el árbol
                  updateForce(colorNodes[counter], colorArcs[counter], data.directed);
                  next();
              }, data.delay);
          })();
        }
                
        // Si el grafo es válido activamos el botón resolver
        var graphOk = data.graphOk
        
      } else {  // Si no es nuevo actualizamos el grafo
        // Nodos y arcs marcados
        var colorNodes = new Array();  // necesario array
        if (!isNaN(data.colorNodes)) {  // comprobar si es un único número
          colorNodes.push(data.colorNodes);
        } else {
          colorNodes = data.colorNodes;
        };
        var colorArcs = new Array();  // necesario array
        if (!isNaN(data.colorArcs)) {  // comprobar si es un único número
          colorArcs.push(data.colorArcs);
        } else {
          colorArcs = data.colorArcs;
        };
          // Marcar el árbol
          var maxLoops = data.stages - 1;
          var counter = -1;
          (function next() {
              if (counter++ >= maxLoops) return;
              setTimeout(function() {
                  // Marcar el árbol
                  updateForce(colorNodes[counter], colorArcs[counter], data.directed);
                  next();
              }, data.delay);
          })();
      };
    }
  });

// Registar output binding con tu nombre y el nombre del output
Shiny.outputBindings.register(networkOutputBinding, 'mfc.networkbinding');
/* ------------------------------------------------------------------------- */