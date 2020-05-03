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
  public xmlItemsReturn: any;
  time = new Date();
  timer;
  url = "http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML_WithNumMins?StationCode=PTLSE&NumMins=90"
  constructor(private http: HttpClient) {

  }


  getData() {
    const data = this.http.get(this.url, { headers: new HttpHeaders({ 'Accept': 'application/xml' }), responseType: 'text' })
    data.subscribe(xmlData => {
      this.parseXML(xmlData, "Portlaoise")
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
    this.getData()
    this.timer = setInterval(() => {
      this.time = new Date();
    }, 1000)
    setInterval(() => { this.getData() }, 60 * 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
