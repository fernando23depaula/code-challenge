$(document).ready(function() {   
    var map; //mapa
    var directionsService = new google.maps.DirectionsService();//Direcao no mapa
    var info = new google.maps.InfoWindow({maxWidth: 200});//Largura do box info
    var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true}); //Objeto para direção
    var batmanPosition = new google.maps.LatLng('40.746422','-73.994753');//posicao do batman no mapa
    var marker;
    var iconeMarcador;
    // Cria o marcador do batman

    
      marker = new google.maps.Marker({
        title: 'Posição Atual - Batman',
        icon: 'imagens/icones-mapa/batman.png',
        animation: google.maps.Animation.DROP,
        draggable:true,
        position: batmanPosition
      });
    
    

    // Inicializa o mapa com o posição do batman
    function initialize() {

      var options = {
          zoom: 15,
          center: marker.position,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      
      map = new google.maps.Map($('#map_content')[0], options);
      
      marker.setMap(map);
      
      
      google.maps.event.addListener(marker, 'click', function() {
        info.setContent('GCPD - Localização atual');
        info.open(map, marker);
      });

    }

    var viloes = {
      'Charada' : {
        iconeMap: 'imagens/icones-mapa/charada.jpg',
        fotoPerfil: 'imagens/viloes/charada.png'
      },
      'Era Venenosa' :{
        iconeMap:'imagens/icones-mapa/eraVenenosa.jpg',
        fotoPerfil:'imagens/viloes/eraVenenosa.png'
      },
      'Arlequina' :{
        iconeMap:'imagens/icones-mapa/arlequina.png',
        fotoPerfil:'imagens/viloes/arlequina.png'
      },
      'Duas Caras' :{
        iconeMap:'imagens/icones-mapa/duasCaras.jpg',
        fotoPerfil:'imagens/viloes/duasCaras.png'
      },
      'Pinguin' :{
        iconeMap:'imagens/icones-mapa/pinguin.png',
        fotoPerfil:'imagens/viloes/pinguin.png'
      },
      'Mulher Gato' :{
        iconeMap:'imagens/icones-mapa/mulherGato.png',
        fotoPerfil:'imagens/viloes/mulherGato.png'
      },
      'Espantalho' :{
        iconeMap:'imagens/icones-mapa/espantalho.png',
        fotoPerfil:'imagens/viloes/espantalho.png'
      },
      'Coringa':{
        iconeMap: 'imagens/icones-mapa/coringa.png',
        fotoPerfil: 'imagens/viloes/coringa.png'
      },
    };

    
    //Altera a rota 
    function gerarRota(targets, villain){

      var  icones = viloes[villain];
          var  iconeMarcador = 'imagens/icones-mapa/Unknown.png';
          if(icones){
            iconeMarcador = icones.iconeMap;
          }

      
      console.log('icone ',iconeMarcador)
      var markers = [
          {title: 'Posição Batman - Atual'},
          {icon : 'imagens/icones-mapa/batman.png', position: batmanPosition}
      ];

      for(var i = 0; i < targets.length; i++){
        markers.push({title: '#'+(i+1)+' - '+targets[i].place+' ('+targets[i].probability+'%)', icon : iconeMarcador, position:  targets[i].location});
      }

      var waypoints = targets.map(function(target){return {location:target.location, stopover: true}});
      var destino = waypoints.pop();
      console.log('destino', destino.location);

      info.close();//fecha as infos do ponto

     
      marker.setMap(null);//tira o marcador setado para null
      

      // resquest 
      var request = {
            origin: batmanPosition,
            destination: destino.location,
            waypoints: waypoints,
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
        };

      directionsService.route(request, function(response, status) {
        console.log('Response',response)
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            directionsDisplay.setMap(map);

             $.each(markers,function(i){

              marker = new google.maps.Marker({
                title: markers[i].title,
                icon: markers[i].icon,
                // icon: iconeMarcador,
                animation: google.maps.Animation.DROP,
                draggable: false,
                position: markers[i].position,

                map: map
              });
            })


          }
      });

    }


  
      

      $('#inputCoordenadasVilao').on('submit',function(){

        var latitude = $('#litudeVilao').val();
        var longitude = $('#longitudeVilao').val();

        $.ajax({
          url: 'http://code-challenge.maplink.com.br/coordinate?q='+latitude+','+longitude,  //URL solicitada
          success: function(data) { //O HTML é retornado em 'data'

          var  villain = viloes[data.villain.name];
          var  perfilFoto = 'imagens/viloes/Unknown.png';
          if(villain){
            perfilFoto = villain.fotoPerfil;
          }
           
            $('#alvosList').remove();

            $('#containerMapa').removeClass('col-lg-12 col-md-12');
            $('#containerMapa').addClass('col-lg-8 col-md-8');
            $('#linhaGeral').prepend('<div class="col-lg-4 col-md-4" id="alvosList"></div>');
            $('#alvosList').append('<div id="dadosVilao"></div>');
            
            $('#dadosVilao').append('<div class="thumbnail" id="perfil"></div>');
            $('#perfil').append('<img src="'+perfilFoto+'"  alt="'+data.villain.name+'">');
            $('#perfil').append('<div class="caption"></div>');
            $('#perfil .caption').append('<h4><b class="destaques">Villão</b> : <span id="nomeVilao">'+data.villain.name+'</span></h4>');
            $('#perfil .caption').append('<p class="localizacaoVilao">Localização :</p>');
            $('#perfil .caption').append('<p><b class="destaques">Latitude : </b>'+data.villain.location.lat+'</p>');
            $('#perfil .caption').append('<p><b class="destaques">Longitude :</b>'+data.villain.location.lng+'</p>');

            data.targets.sort(function(a,b){return b.probability - a.probability});

            gerarRota(data.targets, data.villain.name);
          }
        });

        return false;
      })


      initialize();
});