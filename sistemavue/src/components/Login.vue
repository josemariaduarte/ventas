<template>
    <v-layout align-center justify-center> <v-flex xs12 sm8 md6 lg5 xl4>
        <v-card>
            <v-toolbar dark color="blue darken-3">
                <v-toolbar-title>
                    Acceso al Sistema
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-text-field autofocus color="accent" label="Email" v-model="email" required>
                </v-text-field>
                <v-text-field v-model="password" type="password" color="accent" label="Contraseña" required>
                </v-text-field>
                <v-flex class="red--text" v-if="errorLogin">
                  {{errorLogin}}
                </v-flex>
            </v-card-text>
            <v-card-actions class="px-3 pb-3">
                <v-flex text-xs-right>
                    <v-btn @click="ingresar" color="primary">Ingresar</v-btn>
                </v-flex>
            </v-card-actions>
        </v-card>
    </v-flex>
    </v-layout>
</template>
<script>
    import axios from 'axios';
    export  default {
      data () {
        return {
          email:'',
          password:'',
          errorLogin:'',
        }
      },
      methods: {
        ingresar () {
          let self = this;
          axios.post('usuario/login', {email: self.email, password: self.password}).
          then(respuesta => {
            self.$store.dispatch("guardarToken", respuesta.data.tokenReturn);
            self.$router.push({name: 'home'})

          }).catch(function (err) {
            self.errorLogin=null;
            if (err.response.status ==404){
              self.errorLogin= 'No existe el usuario o las credenciales son incorrectas';
            } else {
              self.errorLogin = 'Ocurrio un error con el servidor';
            }
          })
        }
      }

    }
</script>
