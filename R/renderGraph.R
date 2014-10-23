# Función para transportar datos al grafo -------------------------------------
renderGraph <- function(expr, env = parent.frame(), quoted = FALSE) {
  
  # Convert the expression + environment into a fuction
  func <- exprToFunction(expr, env, quoted)
  
  function() {
    
    # Recuperar valores
    val <- func()
    
    # Grafo nuevo o actualizado
    if (is.null(val$new.graph)) {  # si no se indica se crea nuevo por defecto
      new.graph <- 1
    } else if (val$new.graph == TRUE) {
      new.graph <- 1  # dibujar grafo nuevo
    } else {
      new.graph <- 0  # no dibujar grafo nuevo
    }
    
    # Tamaño del espacio donde se dibujara el grafo
    # Ancho
    if (is.null(val$width)) {
      width <- 500
    } else {
      width <- val$width
    }
    # Alto
    if (is.null(val$height)) {
      height <- 500
    } else {
      height <- val$height
    }
    
    # Nodos ---------------------------
    # Nodos con sus etiquetas
    nodes <- c(val$nodes)
    
    # Fijar o no posición de los nodos
    if (is.null(val$fixed)) {
      fixed <- rep(0, length(nodes))
    } else {
      fixed <- val$fixed
    }
    
    # Coordenadas
    if (is.null(val$coords)) {
      coords <- matrix(rep(0, length(nodes) * 2), ncol = 2, byrow = TRUE)
    } else {
      coords <- val$coords
    }
    
    # Colores de los nodos
    if (is.null(val$color.nodes)) {
      color.nodes <- rep(0, length(nodes))
    } else {
      color.nodes <- val$color.nodes 
    }
    
    # Arcos ---------------------------
    # Matriz con la lista de arcos del grafo
    if (is.null(val$arcs)) {
      arcs <- matrix(c(0,0,0), ncol = 3, byrow = TRUE)
      # Cambiar nombres de las columnas para objeto D3 force layout
      colnames(arcs) <- c("source", "target", "weight")
    } else {
      arcs <- matrix(val$arcs, ncol = 3)
      # Cambiar nombres de las columnas para objeto D3 force layout
      colnames(arcs) <- c("source", "target", "weight")
      # Reducir números de nodos para empezar con fuente = 0
      arcs[, 1] <- arcs[, 1] - 1
      arcs[, 2] <- arcs[, 2] - 1
    }
    
    # Arcos dirigidos o no
    if (is.null(val$directed)) directed <- FALSE
    else directed <- val$directed
    
    # Colores de los arcos
    if (is.null(val$color.arcs)) {
      color.arcs <- rep(0, nrow(arcs))
    } else {
      color.arcs <- val$color.arcs
    }
        
    # Grafo válido o no para problemas concretos
    if (is.null(val$graphOk)) {
      graphOk <- 1
    } else if (val$graphOk == TRUE) {
      graphOk <- 1
    } else {
      graphOk <- 0
    }
    
    # Grafo válido o no para problemas concretos
    if (is.null(val$delay)) delay <- 0
    else delay <- val$delay
    
    # Fondo
    bgimg <- val$bgimg
    
    # Lista de datos a devolver -------
    list(newGraph = new.graph,  # grafo nuevo o no
         width = width,  # ancho de la superficie de dibujo
         height = height,  # alto de la superficie de dibujo
         bgimg = bgimg,
         names = nodes,  # vector de nodos
         fixed = fixed,  # nodos fijados o no
         xcoord = coords[, 1],  # coordenadas nodos eje x
         ycoord = coords[, 2],  # coordenadas nodos eje y
         colorNodes = color.nodes,  # colores de los nodos
         links = arcs,  # lista de arcos del grafo
         directed = directed,  # arcos dirigidos o no
         colorArcs = color.arcs,  # colores de los arcos
         graphOk = graphOk,  # grafo váido o no para problemas determinados
         stages = val$stages,
         delay = delay)
    
  }
  
}
#-----------------------------------------------------------------------------#

# UI part ---------------------------------------------------------------------
graphOutput <- function (outputId, inline = FALSE) {
  container <- if (inline) 
    span
  else div
  container(id = outputId, class = "shiny-network-output")
}
#-----------------------------------------------------------------------------#