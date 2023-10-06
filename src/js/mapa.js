(function() {
    
    //Logical Or
    // Coordenadas de El Salvador
    // const lat = document.querySelector('#lat').value || 13.704449674254128;
    // const lng = document.querySelector('#lng').value || -89.25544429407591;

    // Coordenadas de Venezuela
    const lat = document.querySelector('#lat').value || 10.4906463;
    const lng = document.querySelector('#lng').value || -66.8575886;
    const mapa = L.map('mapa').setView([lat, lng ], 16);
    let marker;
     
    // Utlizar Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // El Pin
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
    .addTo(mapa)

    // Detectar el movimiento del pin
    marker.on('moveend', function(e){
        marker = e.target
        const posicion = marker.getLatLng();
        // console.log(posicion)
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng))
        
        // Obtener la información de la calles la soltar el pin
        geocodeService.reverse().latlng(posicion, 13).run(function(error, resultado) {
            //console.log(resultado)

            marker.bindPopup(resultado.address.LongLabel)   

            // LLenar los campos 
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })
    })


})()

