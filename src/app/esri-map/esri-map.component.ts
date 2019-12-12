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
	
  constructor(private http: HttpClient) { }

  ngAfterViewInit() {
  	loadModules([
      'esri/Map',
      'esri/Color',
      'esri/PopupTemplate',
      'esri/views/MapView',
      'esri/layers/GeoJSONLayer',
      'esri/renderers/SimpleRenderer',
      'esri/symbols/SimpleLineSymbol',
      'esri/symbols/SimpleFillSymbol'
    ])
      .then(([
      	EsriMap, 
      	EsriColor,
      	EsriPopupTemplate,
      	EsriMapView, 
      	EsriGeoJSONLayer, 
      	EsriSimpleRenderer,
      	EsriSimpleLineSymbol, 
      	EsriSimpleFillSymbol
      ]) => {
      	
      	var http_client = this.http;
    		var base_url = 'https://api.census.gov/data/2013/language?get=LAN7,LANLABEL&EST=0:1000000000'
      	var getApiData = function(target) {
		      // generate url depending on if this feature is a state or county
		      let url;
		      if(target.graphic.attributes.COUNTY)
		        url = base_url + '&for=county:' + target.graphic.attributes.COUNTY + '&in=state:' + target.graphic.attributes.STATE + '&key=691994fbcdf058cfe7236db1e35f507ad5dd22ba';
		      else
		        url = base_url + '&for=state:' + target.graphic.attributes.STATE + '&key=691994fbcdf058cfe7236db1e35f507ad5dd22ba';
		      
		      // promisify API call and then return promised content
		      const promise = http_client.get(url).toPromise();
		      return promise.then((data: any[]) => {
		      	console.log(data)
		          if(!data){
		            return '<p><b>Data Unavailable</b><br>This likely occured because tabulations are only kept for counties with 100,000 or more total population and 25,000 or more speakers of languages other than English and Spanish.</p>';
		          }

		          // hardcoding the indicies would probably be fine but just in case the columns returns in an unexpected order...
		          var labelIndex = data[0].indexOf('LANLABEL');
		          var populationIndex = data[0].indexOf('EST');
		          
		          // add each LAN7 result to the popup html
		          var popupContent = '<p>';
		          for(var i = 1; i < data.length; i++){
		            popupContent += '<b>'+data[i][labelIndex]+':</b> '+data[i][populationIndex]+'<br>';
		          }
		          popupContent += '</p>';
		          
		          // push to the popup
		          return popupContent;
		        })
		    }

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
						   popupEnabled: true,
						   popupTemplate: new EsriPopupTemplate({
						   	 title: '{NAME}',
						   	 content: getApiData
						   }),
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
						   popupEnabled: true,
						   popupTemplate: new EsriPopupTemplate({
						   	 title: '{NAME}',
						   	 content: getApiData
						   }),
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
