import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})

export class EsriMapComponent implements AfterViewInit {
	
	// private instance variables to track map & layers
	private map;
	private layers;

	@ViewChild('mapViewNode', {static: false}) private mapViewEl: ElementRef;
	
  constructor() { }

  ngAfterViewInit() {
  	loadModules([
      'esri/Map',
      'esri/Color',
      'esri/views/MapView',
      'esri/layers/GeoJSONLayer',
      'esri/renderers/SimpleRenderer',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleFillSymbol'
    ])
      .then(([
      	EsriMap, 
      	EsriColor,
      	EsriMapView, 
      	EsriGeoJSONLayer, 
      	EsriSimpleRenderer,
      	EsriSimpleLineSymbol, 
      	EsriSimpleFillSymbol
      ]) => {

        // initialize map
        this.map = new EsriMap({
          basemap: 'gray'
        });
        
        // initialize layers (invisible to start)
        var outline = new EsriGeoJSONLayer({
						   url: "../../assets/geo/us_outline_5m.json",
						   renderer: new EsriSimpleRenderer({
			      		 symbol: new EsriSimpleLineSymbol({
				      	   color: new EsriColor("#000000")
				      	 })
			      	 }),
						   visible: false
						}),
		        states = new EsriGeoJSONLayer({
						   url: "../../assets/geo/us_states_5m.json",
						   opacity: .5,
						   renderer: new EsriSimpleRenderer({
			      		 symbol: new EsriSimpleFillSymbol({
				      	   color: new EsriColor("#666666")
				      	 })
			      	 }),
						   visible: false,
						   copyright: "This product uses the Census Bureau Data API but is not endorsed or certified by the Census Bureau."
						}),
		        counties = new EsriGeoJSONLayer({
						   url: "../../assets/geo/us_counties_5m.json",
						   opacity: .7,
						   renderer: new EsriSimpleRenderer({
			      		 symbol: new EsriSimpleLineSymbol({
				      	   color: new EsriColor("#800000")
				      	 })
			      	 }),
						   visible: false,
						   copyright: "This product uses the Census Bureau Data API but is not endorsed or certified by the Census Bureau."
						}),
		        congressional = new EsriGeoJSONLayer({
						   url: "../../assets/geo/us_congressional_5m.json",
						   opacity: .5,
						   renderer: new EsriSimpleRenderer({
			      		 symbol: new EsriSimpleLineSymbol({
				      	   color: new EsriColor("#000080")
				      	 })
			      	 }),
						   visible: false
						});
				this.layers = [outline, states, counties, congressional];
				
				// attach layers to map object
				this.map.addMany(this.layers)
        
        // set map view centered on US
        const mapView = new EsriMapView({
          container: this.mapViewEl.nativeElement,
          center: [-98.5795, 39.8282],
          zoom: 4,
          map: this.map
        });
        
      })
      .catch(err => {
        console.error(err);
      });
  }
  
  // on dropdown menu click event, switch visibility of corrosponding overlay
  addOrRemoveLayer(event, index){
  	event.preventDefault();
  	
  	if(this.layers[index].visible)
  		this.layers[index].visible = false;
  	else
  		this.layers[index].visible = true;
  }
}
