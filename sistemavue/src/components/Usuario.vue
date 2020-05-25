<template>
    <v-layout >
        <v-flex>
            <v-toolbar flat color="white">
                <v-toolbar-title>Usuarios</v-toolbar-title>
                <v-divider class="mx-2" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <v-text-field class="text-xs-center" v-model="search" append-icon="search"
                              label="Búsqueda" single-line hide-details></v-text-field>
                <v-spacer></v-spacer>
                <v-dialog v-model="dialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" dark class="mb-2" v-on="on">Nuevo</v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>

                        <v-card-text>
                            <v-container grid-list-md>
                                <v-layout wrap>
                                    <v-flex xs12 sm6 md6>
                                        <v-text-field v-model="nombre" label="Nombre"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm12 md6>
                                        <v-select v-model="rol"
                                        :items="roles" label="Rol">
                                        </v-select>
                                    </v-flex>
                                    <v-flex xs12 sm6 md6>
                                        <v-select v-model="tipo_documento"
                                        :items="documentos" label="Tipo Documento">
                                        </v-select>
                                    </v-flex>
                                    <v-flex xs12 sm6 md6>
                                        <v-text-field v-model="num_documento" label="Numero de Documento"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6 md6>
                                        <v-text-field v-model="direccion" label="Direccion"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6 md6>
                                        <v-text-field v-model="telefono" label="Teléfono"></v-text-field>
                                    </v-flex>
                                      <v-flex xs12 sm6 md6>
                                        <v-text-field v-model="email" label="Email"></v-text-field>
                                    </v-flex>
                                      <v-flex xs12 sm6 md6>
                                        <v-text-field type="password" v-model="password" label="Password"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm12 md12>
                                        <div class="red--text" v-for="v in validarMensaje" :key="v" v-text="v">
                                        </div>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="red darken-1" text @click="close">Cancelar</v-btn>
                            <v-btn color="blue darken-1" text @click="guardar">Guardar</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-dialog
                    v-model="addModal"
                    max-width="290">
                    <v-card>
                        <v-card-title class="headline">
                            {{ actionTitle }}
                        </v-card-title>
                        <v-card-text>
                            Estas a punto de {{ getAction }} el item {{ addNombre }}
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="activarDesactivarCerrar" color="green darken-1" text="text">
                                Cancelar
                            </v-btn>
                            <v-btn v-if="addAccion===1" @click="activar" color="orange darken-4" text="text">
                                Activar
                            </v-btn>
                            <v-btn v-if="addAccion===2" @click="desactivar" color="orange darken-4" text="text">
                                Desactivar
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

            </v-toolbar>
            <v-data-table
                    :headers="headers"
                    :items="usuarios"
                    :search="search"
                    class="elevation-1">
                <template v-slot:item.opciones="{ item }">
                    <v-icon small class="mr-2" @click="editItem(item)">
                        edit
                    </v-icon>
                    <v-icon v-if="item.estado" small class="mr-2" @click="activarDesactivarMostrar(2, item)">
                        block
                    </v-icon>
                    <v-icon v-if="!item.estado" small class="mr-2" @click="activarDesactivarMostrar(1, item)">
                        check
                    </v-icon>
                </template>

                <template v-slot:item.estado="{ item }">

                    <div v-if="item.estado">
                        <span class="blue--text">Activo</span>
                    </div>
                    <div v-else>
                        <span class="red--text">Inactivo</span>
                    </div>
                </template>

                <template v-slot:no-data>
                    <v-btn color="primary" @click="listar">Resetear</v-btn>
                </template>
            </v-data-table>
        </v-flex>
    </v-layout>
</template>
<script>
  import axios from 'axios';
  export default {
    data() {
      return {
        dialog: false,
        search: '',
        usuarios: [],
        headers: [
          {text: 'Opciones', value: 'opciones', sortable: false},
          {text: 'Nombre', value: 'nombre', sortable: true},
          {text: 'Rol', value: 'rol', sortable: true},
          {text: 'Tipo Documento', value: 'tipo_documento', sortable: false},
          {text: 'Numero Documento', value: 'num_documento', sortable: false},
          {text: 'Direccion', value: 'direccion', sortable: false},
          {text: 'Teléfono', value: 'telefono', sortable: false},
          {text: 'Email', value: 'email', sortable: false},
          {text: 'Estado', value: 'estado', sortable: false},
        ],
        editedIndex: -1,
        _id: '',
        nombre: '',
        rol: '',
        roles: ['Administrador', 'Almacenero', 'Vendedor'],
        tipo_documento: '',
        documentos: ['DNI', 'RUC', 'PASAPORTE', 'CEDULA'],
        num_documento: '',
        direccion: '',
        telefono: '',
        email: '',
        password: '',
        valida: 0,
        validarMensaje: [],
        addModal:0,
        addAccion:0,
        addNombre: '',
        addId: ''
      }
    },

    computed: {
      formTitle() {
        return this.editedIndex === -1 ? 'Nuevo Registro' : 'Editar Registro'
      },

      actionTitle() {
        return this.addAccion === 1 ? 'Activar Item' : 'Desactivar Item'
      },
      getAction() {
        return this.addAccion === 1 ? 'activar' : 'desactivar'
      },
    },

    watch: {
      dialog(val) {
        val || this.close()
      },
    },

    created() {
      this.listar()
    },

    methods: {

      getConfiguration(){
        let header ={"Token": this.$store.state.token};
        return {headers: header};

      },

      listar () {
        let self = this;
        let configuration = self.getConfiguration();
        axios.get('usuario/list', configuration).then(function (res) {
          self.usuarios = res.data;
        }).catch(function (err) {
          console.log(err)
        })
      },

      limpiar () {
        // limpiamos los atributos del formulario
        this._id='';
        this.nombre='';
        // this.rol='';
        this.num_documento='';
        this.direccion='';
        this.telefono='';
        this.email='';
        this.password='';
        // limpiamos los elementos de validacion
        this.valida=0;
        this.validarMensaje=[];
        //
        this.editedIndex = -1;
      },

      validar () {
        this.valida = 0;
        this.validarMensaje = [];
        if (!this.rol) {
          this.validarMensaje.push('Campo obligatorio')
        }
        if (this.nombre.length <1 || this.nombre.length > 50) {
          this.validarMensaje.push('El nombre debe tener entre 1-50 caracteres')
        }
        if (this.num_documento.length > 20) {
          this.validarMensaje.push('El documento no debe tener mas de 20 caracteres')
        }
        if (this.direccion.length > 70) {
          this.validarMensaje.push('La dirección no debe tener mas de 70 caracteres')
        }
        if (this.telefono || this.telefono.length > 20) {
          this.validarMensaje.push('El teléfono no debe tener mas de 20 caracteres')
        }
        if (this.email.length <1 || this.email.length > 50) {
          this.validarMensaje.push('El Email debe tener entre 1-50 caracteres')
        }
        if (this.password.length <1 || this.password.length > 64) {
          this.validarMensaje.push('El Email debe tener entre 1-64 caracteres')
        }

        
        //
        if (this.validarMensaje.length) {
          this.valida = 1;
        }
        return this.valida;
      },

      guardar () {
        let self = this;
        let configuration = self.getConfiguration();
        if (this.validar()){
          return;
        }
        if (self.editedIndex > -1) {
          // codigo para editar
          axios.put('usuario/update', 
          {
            '_id': this._id,
            'nombre': this.nombre,
            'rol': this.rol,
            'tipo_documento': this.tipo_documento,
            'num_documento': this.num_documento,
            'direccion': this.direccion,
            'telefono': this.telefono,
            'email': this.email,
            'password': this.password
          }, configuration)
            .then(function (response) {
              self.limpiar();
              self.close();
              self.listar();
            }).catch(function (err) {
            console.log(err);
          });
        } else {
          // codigo para guardar
          axios.post('usuario/add', 
          {
            'nombre': this.nombre,
            'rol': this.rol,
            'tipo_documento': this.tipo_documento,
            'num_documento': this.num_documento,
            'direccion': this.direccion,
            'telefono': this.telefono,
            'email': this.email,
            'password': this.password
           }, configuration)
            .then(function (response) {
              self.limpiar();
              self.close();
              self.listar();
            }).catch(function (err) {
            console.log(err);
          });
        }
      },

      editItem(item) {
        // permite mostrar los campos a editar
        this._id = item._id;
        this.rol = item.rol
        this.nombre = item.nombre;
        this.tipo_documento = item.tipo_documento;
        this.num_documento = item.num_documento;
        this.direccion = item.direccion;
        this.telefono = item.telefono;
        this.email = item.email;
        this.password = item.password;
        //
        this.dialog = true;
        this.editedIndex = 1; // cuando esta variable es 1 significa que es para la edicion
      },

      activarDesactivarMostrar(action, item) {
        this.addModal = 1;   // controla para que se muestre el modal
        this.addNombre = item.nombre;
        this.addId = item._id;
        if (action === 1) {
          this.addAccion = 1;
        } else if (action === 2){
          this.addAccion = 2;
        } else{
          this.addModal = 0;
        }
      },

      activarDesactivarCerrar(){
        this.addModal=0;
      },

      activar () {
        let self=this;
        let configuration = self.getConfiguration();
        axios.put('usuario/activate', {'_id': self.addId}, configuration)
          .then(function (response) {
            self.addModal=0;
            self.addAccion=0;
            self.addNombre='';
            self.addId='';
            self.listar();
          }).catch(function (err) {
          console.log(err);
        });
      },

      desactivar () {
        let self=this;
        let configuration = self.getConfiguration();
        axios.put('usuario/deactivate', {'_id': this.addId }, configuration)
          .then(function (response) {
            self.addModal=0;
            self.addAccion=0;
            self.addNombre='';
            self.addId='';
            self.listar();

          }).catch(function (err) {
          console.log(err);
        });
      },


      close() {
        this.dialog = false
        // setTimeout(() => {
        //   this.editedItem = Object.assign({}, this.defaultItem)
        //   this.editedIndex = -1
        // }, 300)
      }
    },
  }
</script>

