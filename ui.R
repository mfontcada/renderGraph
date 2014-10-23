source('R/renderGraph.R')

shinyUI(fluidPage(
  
  tags$head(
    
    # For D3.js, http://d3js.com/
    tags$script(src = 'http://d3js.org/d3.v3.min.js'),
    
    # For Optrees, http://optrees.net/
    tags$script(src = 'js/renderGraph.js'),
    tags$link(rel = 'stylesheet', type = 'text/css', href = 'css/renderGraph.css')
    
  ),
  
  graphOutput('graph')
  
))
