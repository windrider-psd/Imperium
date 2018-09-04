var isLider

$(document).ready(function() {
    if(userdata.alianca != null)
    {
        isLider = userdata.session.id == userdata.alianca.lider
    }
    else 
        isLider = false

})

