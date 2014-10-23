library(shiny)
source('R/renderGraph.R')

shinyServer(function(input, output) {
  
  nodes <- 1:4
  arcs <- matrix(c(1,2,1, 1,3,2, 1,4,3, 2,3,4, 2,4,5, 3,4,6), ncol = 3, byrow = TRUE)
  
  output$graph <- renderGraph({
    list(nodes = nodes, arcs = arcs)
  })
  
})