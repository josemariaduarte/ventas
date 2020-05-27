<template>
    <v-layout >
        <v-flex>
            <v-toolbar flat color="white">
                <v-toolbar-title>Articulo</v-toolbar-title>
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
                                        <v-text-field v-model="codigo" label="Codigo"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6 md6>
                                        <v-select v-model="categoria"
                                          :items="categorias"
                                          item-text="text"
                                          item-value="value"
                                          label="Categoria">
                                        </v-select>
                                    </v-flex>
                                    <v-flex xs12 sm12 md12>
                                        <v-text-field v-model="nombre" label="Nombre"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6 md6>
                                        <v-text-field type="number" v-model="stock" label="Stock"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm6 md6>
                                        <v-text-field type="number" v-model="precio_venta" label="Precio Venta"></v-text-field>
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
                    :items="articulos"
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
        articulos: [],
        headers: [
          {text: 'Opciones', value: 'opciones', sortable: false},
          {text: 'Codigo', value: 'codigo', sortable: true},
          {text: 'Nombre', value: 'nombre', sortable: true},
          {text: 'Categoria', value: 'categoria.nombre', sortable: true},
          {text: 'Stock', value: 'stock', sortable: false},
          {text: 'Precio Venta', value: 'precio_venta', sortable: false},
          {text: 'Descripcion', value: 'descripcion', sortable: false},
           {text: 'Estado', value: 'estado', sortable: false},
        ],
        editedIndex: -1,
        _id: '',
        codigo: '',
        categoria: '',
        categorias: [ ],
        nombre: '',
        stock: 0,
        precio_venta: 0,
        descripcion: '',
        //
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
      this.listar();
      this.selectCategoria();
    },

    methods: {

      getConfiguration(){
        let header ={"Token": this.$store.state.token};
        return {headers: header};

      },

      selectCategoria(){
        let self = this;
        let configuration = self.getConfiguration();
        let categoriaArray= [];
        axios.get('categoria/list', configuration).then(function (res) {
          categoriaArray = res.data;
          // recorremos las categorias para agregar a las categorias de la clase
          categoriaArray.map(function(resp){
            self.categorias.push({text: resp.nombre, value:resp._id});
          })
        }).catch(function (err) {
          console.log(err)
        })

      },

      listar () {
        let self = this;
        let configuration = self.getConfiguration();
        axios.get('articulo/list', configuration).then(function (res) {
          self.articulos = res.data;
        }).catch(function (err) {
          console.log(err)
        })
      },

      limpiar () {
        // limpiamos los atributos del formulario
        this._id='';
        this.nombre='';
        this.codigo='';
        this.categoria='';
        this.stock=0;
        this.precio_venta=0;
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
        if (!this.categoria){
          this.validarMensaje.push('Seleccione una Categori')
        }
        if (this.codigo.length > 64) {
          this.validarMensaje.push('El codigo no debe tener mas de 64 caracteres')
        }
        if (this.nombre.length < 1 || this.nombre.length > 50) {
          this.validarMensaje.push('El nombre debe tener entre 1-50 caracteres')
        }
         if (this.descripcion.length > 255) {
          this.validarMensaje.push('La descripcion no debe tener mas de 250 caracteres')
        }
        if (this.stock.length < 0) {
          this.validarMensaje.push('El Stock debe ser mayor a cero')
        }
        if (this.precio_venta.length < 0) {
          this.validarMensaje.push('El Precio de Venta debe ser mayor a cero')
        }
        //
        if (this.validarMensaje.length) {
          this.valida = 1;
        }
        return this.valida;
      },

      guardar () {
        let self = this;
        let configuration = this.getConfiguration();
        if (this.validar()){
          return;
        }
        if (self.editedIndex > -1) {
          // codigo para editar
          axios.put('articulo/update', 
          {
            '_id': this._id,
            'codigo': this.codigo,
            'categoria': this.categoria,
            'nombre': this.nombre,
            'stock': this.stock,
            'precio_venta': this.precio_venta,
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
          axios.post('articulo/add',
           {
             'codigo': this.codigo,
             'categoria': this.categoria,
             'nombre': this.nombre,
             'stock': this.stock,
             'precio_venta': this.precio_venta,
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
        this.codigo = item.codigo;
        this.categoria = item.categoria._id;
        this.nombre = item.nombre;
        this.stock = item.stock;
        this.precio_venta = item.precio_venta;
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
        let configuration = this.getConfiguration();
        axios.put('articulo/activate', {'_id': self.addId}, configuration)
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
        let configuration = this.getConfiguration();
        axios.put('articulo/deactivate', {'_id': this.addId }, configuration)
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

