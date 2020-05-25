<template>
    <v-layout >
        <v-flex>
            <v-toolbar flat color="white">
                <v-toolbar-title>Categorías</v-toolbar-title>
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
                                    <v-flex xs12 sm12 md12>
                                        <v-text-field v-model="nombre" label="Nombre"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm12 md12>
                                        <v-text-field v-model="descripcion" label="Descripcion"></v-text-field>
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
                    :items="categorias"
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
        categorias: [],
        headers: [
          {text: 'Opciones', value: 'opciones', sortable: false},
          {text: 'Nombre', value: 'nombre', sortable: true},
          {text: 'Descripcion', value: 'descripcion', sortable: true},
          {text: 'Estado', value: 'estado', sortable: false},
        ],
        editedIndex: -1,
        _id: '',
        nombre: '',
        descripcion: '',
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
      listar () {
        let self = this;
        let header ={"Token": this.$store.state.token};
        let configuration = {headers: header};
        axios.get('categoria/list', configuration).then(function (res) {
          self.categorias = res.data;
        }).catch(function (err) {
          console.log(err)
        })
      },

      limpiar () {
        // limpiamos los atributos del formulario
        this._id='';
        this.nombre='';
        this.descripcion='';
        // limpiamos los elementos de validacion
        this.valida=0;
        this.validarMensaje=[];
        //
        this.editedIndex = -1;
      },

      validar () {
        this.valida = 0;
        this.validarMensaje = [];
        if (this.nombre.length <1 || this.nombre.length > 50) {
          this.validarMensaje.push('El nombre de la Categoria debe tener entre 1-50 caracteres')
        }
        if (this.descripcion.length > 255) {
          this.validarMensaje.push('La descripcion de la Categoria no debe tener mas de 250 caracteres')
        }
        //
        if (this.validarMensaje.length) {
          this.valida = 1;
        }
        return this.valida;
      },

      guardar () {
        let self = this;
        if (this.validar()){
          return;
        }
        let header ={"Token": this.$store.state.token};
        let configuration = {headers: header};
        if (self.editedIndex > -1) {
          // codigo para editar
          axios.put('categoria/update', 
          {
            '_id': this._id,
            'nombre': this.nombre,
            'descripcion': this.descripcion
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
          axios.post('categoria/add',
           {
             'nombre': this.nombre,
             'descripcion': this.descripcion
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
        this._id = item._id;
        this.nombre = item.nombre;
        this.descripcion = item.descripcion;
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
        let header ={"Token": this.$store.state.token};
        let configuration = {headers: header};
        axios.put('categoria/activate', {'_id': self.addId}, configuration)
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
        let header ={"Token": this.$store.state.token};
        let configuration = {headers: header};
        axios.put('categoria/deactivate', {'_id': this.addId }, configuration)
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

