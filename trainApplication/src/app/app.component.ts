import { Component } from '@angular/core';
import xml2js from 'xml2js';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'trainApplication';
  public xmlItems: any;
  time = new Date();
  timer;
  url = "http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML_WithNumMins?StationCode="
  //these are the stations I actually use so I used these 
  athyCode = "ATHY"
  athy = "Athy"
  portlaoiseCode = "PTLSE"
  portlaoise = "Portlaoise"
  carlowCode = "CRLOW"
  carlow = "Carlow"
  mins = "&NumMins=90"
  athyInterval
  portLoaiseInterval
  carlowInterval
  constructor(private http: HttpClient) {

  }
  //the request is made automatically every minute, this is used to stop it if the user changes station
  stopInterval(interval, interval2) {
    clearInterval(interval);
    clearInterval(interval2);
    console.log("intervals Stopped")
  }


  toggleAthy() {
    this.stopInterval(this.portLoaiseInterval, this.carlowInterval)
    this.getData(this.athyCode, this.athy)
    //makes request every 60 seconds, updates data in html template 
    this.athyInterval = setInterval(() => { this.getData(this.athyCode, this.athy) }, 60 * 1000);
  }

  togglePortlaoise() {
    this.stopInterval(this.athyInterval, this.carlowInterval)
    this.getData(this.portlaoiseCode, this.portlaoise)
    this.portLoaiseInterval = setInterval(() => { this.getData(this.portlaoiseCode, this.portlaoise) }, 60 * 1000);
  }

  toggleCarlow() {
    this.stopInterval(this.portLoaiseInterval, this.athyInterval)
    this.getData(this.carlowCode, this.carlow)
    this.carlowInterval = setInterval(() => { this.getData(this.carlowCode, this.carlow) }, 60 * 1000);
  }

  getData(stationCode, stationName) {
    const data = this.http.get(this.url + stationCode + this.mins, { headers: new HttpHeaders({ 'Accept': 'application/xml' }), responseType: 'text' })
    console.log(this.url + stationCode + this.mins)
    data.subscribe(xmlData => {
      this.parseXML(xmlData, stationName)
        .then((xmlData) => {
          this.xmlItems = xmlData;
        });
      console.log(xmlData);
    });
  }


  parseXML(data, station) {
    return new Promise(resolve => {
      var k: string | number,
        arr = [],
        parser = new xml2js.Parser(
          {
            trim: true,
            explicitArray: true
          });
      parser.parseString(data, function (err, result) {
        var obj = result.ArrayOfObjStationData;
        for (k in obj.objStationData) {
          var item = obj.objStationData[k];
          //filtered to only show trains going from the station, thought it made more sense to do so
          if (item.Destination != station) {
            arr.push({
              dueIn: item.Duein[0],
              origin: item.Origin[0],
              dest: item.Destination[0],
              expectedDeparture: item.Expdepart[0],
              arrival: item.Destinationtime[0],
              lastLoc: item.Lastlocation[0]
            });
          }
        }
        resolve(arr);
        console.log(arr)
      });
    });
  }

  ngOnInit() {
    this.timer = setInterval(() => {
      this.time = new Date();
    }, 1000)
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
