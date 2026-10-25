
import Phaser from 'phaser';
import { ESCENARIOS } from './escenarios.js';

// =====================================================
// PEDRO'S MISSING
// CONFIGURACIÓN GENERAL
// =====================================================

const ANCHO = 1280;
const ALTO = 720;

const partida = {
  ubicacion: 'pedro',
  inventario: [],
  inventarioEspecial: [],
  cajonAbierto: false,
  joystickRecogido: false,
  sakuraDesbloqueado: false,
  desafioFranCompletado: false,
  franMonsterEntregada: false,
  franPinzasEntregadas: false,
  posiciones: {
    pedro: { x: 640, y: 620 },
    fran: { x: 640, y: 620 },
    patio: { x: 640, y: 620 },
    sakura: { x: 640, y: 620 }
  }
};

const DESTINOS = Object.values(ESCENARIOS);

// =====================================================
// ZONAS CAMINABLES
// =====================================================

const ZONAS = {
  pedro: {
    limites: {
      izquierda: 55,
      derecha: 1225,
      arriba: 410,
      abajo: 635
    },
    obstaculos: [
      {
        izquierda: 420,
        derecha: 720,
        arriba: 405,
        abajo: 565
      },
      {
        izquierda: 865,
        derecha: 1220,
        arriba: 420,
        abajo: 605
      },
      {
        izquierda: 770,
        derecha: 1035,
        arriba: 405,
        abajo: 475
      },
      {
        izquierda: 130,
        derecha: 415,
        arriba: 410,
        abajo: 475
      }
    ]
  },

  fran: {
    limites: {
      izquierda: 65,
      derecha: 1215,
      arriba: 475,
      abajo: 635
    },
    obstaculos: []
  },

  patio: {
    limites: {
      izquierda: 65,
      derecha: 1215,
      arriba: 445,
      abajo: 635
    },
    obstaculos: []
  },

  sakura: {
    limites: {
      izquierda: 65,
      derecha: 1215,
      arriba: 455,
      abajo: 635
    },
    obstaculos: []
  }
};

// =====================================================
// PANTALLA DE INICIO
// =====================================================

class PantallaInicio extends Phaser.Scene {
  constructor() {
    super('PantallaInicio');
  }

  preload() {
    this.load.image(
      'pantallaCarga',
      '/assets/PANTALLA DE CARGA.jpeg'
    );
  }

  create() {
    // Imagen de fondo
    const fondo = this.add.image(
      ANCHO / 2,
      ALTO / 2,
      'pantallaCarga'
    );

    // Cubrir la pantalla sin deformar la imagen
    const escala = Math.max(
      ANCHO / fondo.width,
      ALTO / fondo.height
    );

    fondo.setScale(escala).setDepth(0);

    // Oscurecimiento para mejorar la lectura
    this.add.rectangle(
      640, 360, 1280, 720,
      0x000000, 0.48
    ).setDepth(1);

    // Título blanco
    this.add.text(
      640, 215,
      "PEDRO'S",
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '100px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 7
      }
    )
      .setOrigin(0.5)
      .setDepth(2);

    // Título rojo
    this.add.text(
      640, 335,
      'MISSING',
      {
        fontFamily: 'Arial Black, Arial',
        fontSize: '115px',
        fontStyle: 'bold',
        color: '#d71920',
        stroke: '#000000',
        strokeThickness: 8
      }
    )
      .setOrigin(0.5)
      .setDepth(2);

    // Botón jugar
    const boton = this.add.rectangle(
      640, 525, 290, 88,
      0x151515, 0.95
    )
      .setStrokeStyle(4, 0xffffff)
      .setDepth(3)
      .setInteractive({ useHandCursor: true });

    const texto = this.add.text(
      640, 525,
      'JUGAR',
      {
        fontFamily: 'Arial',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#ffffff'
      }
    )
      .setOrigin(0.5)
      .setDepth(4);

    boton.on('pointerover', () => {
      boton.setFillStyle(0xb51520);
      boton.setStrokeStyle(4, 0xffffff);
      texto.setScale(1.06);
    });

    boton.on('pointerout', () => {
      boton.setFillStyle(0x151515, 0.95);
      texto.setScale(1);
    });

    boton.on('pointerdown', () => {
      boton.disableInteractive();
      this.cameras.main.fadeOut(
        350, 0, 0, 0
      );

      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => this.scene.start('EscenaCuarto')
      );
    });

    this.cameras.main.fadeIn(
      450, 0, 0, 0
    );
  }
}

// =====================================================
// ESCENA PRINCIPAL
// =====================================================

class EscenaCuarto extends Phaser.Scene {
  constructor() {
    super('EscenaCuarto');
  }

  preload() {
    for (const escenario of DESTINOS) {
      this.load.image(
        escenario.textura,
        escenario.archivo
      );
    }

    const imagenes = {
      normal: '/assets/protagonista/normal.png',
      bong: '/assets/bongardopolis.png',
      llave: '/assets/keynashe.png',
      cajonCerrado: '/assets/CAJON closeup.png',
      cajonAbierto: '/assets/CAJON closeup abierto.png',
      joystick: '/assets/joystick xbox.png',
      iconoMapa: '/assets/mapa.png',
      franNormal: '/assets/Francisco deffault.png',
      franPensando: '/assets/francisco pensando.png',
      franBurlon: '/assets/francisco burlon.png',
      franCientifico: '/assets/francisco cientifico.png'
    };

    Object.entries(imagenes).forEach(
      ([nombre, archivo]) => {
        this.load.image(nombre, archivo);
      }
    );

    for (let i = 1; i <= 4; i++) {
      this.load.image(
        `caminar${i}`,
        `/assets/protagonista/caminar ${i}.png`
      );
    }
  }

  create() {
    this.ubicacionActual = partida.ubicacion;
    this.mapaAbierto = false;
    this.elementosMapa = [];
    this.mensajeMapa = null;

    this.vistaCajonAbierta = false;
    this.elementosVistaCajon = [];
    this.iconosTemporalesCajon = [];

    this.ruta = [];
    this.accionPendiente = null;
    this.velocidad = 220;
    this.dialogoActivo = false;
    this.dialogoElementos = [];
    this.dialogoIndice = 0;
    this.franHablado = false;

    this.objetoSeleccionado = null;
    this.objetoCursor = null;
    this.tiempoHalo = 0;

    this.inventario = partida.inventario;
    this.inventarioEspecial = partida.inventarioEspecial;

    this.casillasInventario = [];
    this.casillasEspeciales = [];

    this.iconosNormales = {};
    this.iconosEspeciales = {};

    this.cajonAbierto = partida.cajonAbierto;
    this.joystickRecogido = partida.joystickRecogido;

    // Fondo
    this.fondoEscenario = this.add.image(
      0, 0, ESCENARIOS.pedro.textura
    )
      .setOrigin(0, 0)
      .setDisplaySize(ANCHO, ALTO)
      .setDepth(0);

    // Animación
    if (!this.anims.exists('caminar')) {
      this.anims.create({
        key: 'caminar',
        frames: [1, 2, 3, 4].map(i => ({
          key: `caminar${i}`
        })),
        frameRate: 8,
        repeat: -1
      });
    }

    // Protagonista
    this.jugador = this.add.sprite(
      640, 620, 'normal'
    )
      .setOrigin(0.5, 1)
      .setDepth(10);

    const escalaAnterior = 396 / this.jugador.height;

    this.jugador.setScale(
      escalaAnterior * 1.25,
      escalaAnterior * 1.07 * 0.82 * 1.10
    );

    // Halo de selección
    this.haloSeleccion = this.add.graphics()
      .setDepth(104)
      .setVisible(false);

    // Interfaz y objetos
    this.crearInventario();
    this.crearInventarioEspecial();
    this.restaurarInventarios();
    this.crearBong();
    this.crearZonaEscritorio();
    this.crearBotonMapa();
    this.crearFran();

    this.crearTexturasPruebaFran();

    // Movimiento
    this.input.on('pointerdown', pointer => {
      if (this.mapaAbierto || this.vistaCajonAbierta || this.dialogoActivo) {
        return;
      }

      const destino = {
        x: pointer.worldX,
        y: pointer.worldY
      };

      if (!this.puntoValido(destino)) return;

      this.accionPendiente = null;

      this.ruta = this.buscarRuta(
        {
          x: this.jugador.x,
          y: this.jugador.y
        },
        destino
      );

      if (this.ruta.length) {
        this.jugador.play('caminar', true);
      } else {
        this.detenerJugador();
      }
    });

    this.input.on('pointermove', pointer => {
      if (this.objetoCursor) {
        this.objetoCursor.setPosition(
          pointer.worldX + 18,
          pointer.worldY + 18
        );
      }
    });

    // Tecla K: llave de prueba
    this.input.keyboard.on('keydown-K', () => {
      if (
        this.ubicacionActual === 'pedro' &&
        !this.cajonAbierto &&
        !this.inventario.includes('llave')
      ) {
        this.agregarAlInventario('llave', 'llave');
      }
    });

    // Teclas de PRUEBA hasta incorporar los objetos a sus escenarios.
    this.input.keyboard.on('keydown-M', () => this.darObjetoPruebaFran('monster'));
    this.input.keyboard.on('keydown-P', () => this.darObjetoPruebaFran('pinzas'));
    this.mostrarUbicacion(this.ubicacionActual);
  }

  // =====================================================
  // ESCENARIOS
  // =====================================================

  mostrarUbicacion(ubicacion) {
    const escenario = ESCENARIOS[ubicacion];
    if (!escenario) return;

    if (
      ubicacion === 'sakura' &&
      !partida.sakuraDesbloqueado
    ) return;

    this.ubicacionActual = ubicacion;
    partida.ubicacion = ubicacion;

    this.fondoEscenario
      .setTexture(escenario.textura)
      .setDisplaySize(ANCHO, ALTO);

    const zona = ZONAS[ubicacion];

    this.limites = { ...zona.limites };
    this.obstaculos = zona.obstaculos.map(
      o => ({ ...o })
    );
    if (ubicacion === 'fran') {
      // Colisión del cuerpo de Fran, con margen para que no se lo atraviese.
      this.obstaculos.push({ izquierda: 742, derecha: 832, arriba: 490, abajo: 580 });
    }

    const posicion = partida.posiciones[ubicacion] ||
      { x: 640, y: 620 };

    this.jugador.setPosition(
      posicion.x, posicion.y
    );

    if (!this.puntoValido({
      x: this.jugador.x,
      y: this.jugador.y
    })) {
      const segura = this.buscarPosicionSegura(
        this.jugador.x, this.jugador.y
      );
      this.jugador.setPosition(segura.x, segura.y);
    }

    this.jugador.setVisible(true);
    this.franNPC.setVisible(ubicacion === 'fran');
    if (ubicacion === 'fran') this.franNPC.setInteractive({ useHandCursor: true });
    else this.franNPC.disableInteractive();

    if (this.bong?.active) {
      this.bong.setVisible(ubicacion === 'pedro');

      if (ubicacion === 'pedro') {
        this.bong.setInteractive({
          useHandCursor: true
        });
      } else {
        this.bong.disableInteractive();
      }
    }

    if (ubicacion === 'pedro') {
      this.zonaEscritorio
        .setVisible(true)
        .setInteractive({ useHandCursor: true });
    } else {
      this.zonaEscritorio
        .setVisible(false)
        .disableInteractive();
    }
  }

  buscarPosicionSegura(x, y) {
    const l = this.limites;

    const inicial = {
      x: Phaser.Math.Clamp(
        x, l.izquierda, l.derecha
      ),
      y: Phaser.Math.Clamp(
        y, l.arriba, l.abajo
      )
    };

    if (this.puntoValido(inicial)) return inicial;

    for (let radio = 10; radio <= 500; radio += 10) {
      for (let angulo = 0; angulo < 360; angulo += 15) {
        const rad = Phaser.Math.DegToRad(angulo);

        const candidato = {
          x: inicial.x + Math.cos(rad) * radio,
          y: inicial.y + Math.sin(rad) * radio
        };

        if (this.puntoValido(candidato)) {
          return candidato;
        }
      }
    }

    return { x: 640, y: 620 };
  }

  // =====================================================
  // BOTÓN MAPA
  // =====================================================

  crearBotonMapa() {
    const textura = this.textures.get('iconoMapa');
    const imagen = textura.getSourceImage();

    const escala = Math.min(
      76 / imagen.width,
      66 / imagen.height
    );

    this.botonMapa = this.add.image(
      1218, 679, 'iconoMapa'
    )
      .setDisplaySize(
        imagen.width * escala,
        imagen.height * escala
      )
      .setDepth(210)
      .setInteractive({ useHandCursor: true });

    this.botonMapa.on(
      'pointerdown',
      (pointer, x, y, event) => {
        event.stopPropagation();
        if (this.vistaCajonAbierta || this.dialogoActivo) return;
        this.abrirMapa();
      }
    );
  }

  // =====================================================
  // MAPA DE UBICACIONES
  // =====================================================

  abrirMapa() {
    if (this.mapaAbierto || this.dialogoActivo) return;

    this.mapaAbierto = true;
    this.guardarPosicionActual();
    this.detenerJugador();
    this.accionPendiente = null;
    this.deseleccionarObjeto();
    this.elementosMapa = [];

    const agregar = objeto => {
      this.elementosMapa.push(objeto);
      return objeto;
    };

    const fondo = agregar(
      this.add.rectangle(
        640, 360, 1280, 720, 0x263c31
      )
        .setDepth(600)
        .setInteractive()
    );

    fondo.on('pointerdown', (p, x, y, e) => {
      e.stopPropagation();
    });

    agregar(
      this.add.rectangle(
        640, 360, 1200, 665, 0xd9d3bb
      )
        .setDepth(601)
        .setStrokeStyle(6, 0x17291c)
    );

    agregar(
      this.add.text(
        640, 72, 'MAPA DE UBICACIONES',
        {
          fontFamily: 'Arial',
          fontSize: '43px',
          fontStyle: 'bold',
          color: '#192d1f'
        }
      )
        .setOrigin(0.5)
        .setDepth(602)
    );

    agregar(
      this.add.text(
        640, 120,
        'Elegí a dónde querés viajar',
        {
          fontFamily: 'Arial',
          fontSize: '21px',
          color: '#455446'
        }
      )
        .setOrigin(0.5)
        .setDepth(602)
    );

    const posiciones = [
      { x: 360, y: 265 },
      { x: 920, y: 265 },
      { x: 360, y: 525 },
      { x: 920, y: 525 }
    ];

    DESTINOS.forEach((destino, indice) => {
      const posicion = posiciones[indice];
      if (!posicion) return;

      this.crearTarjetaMapa(
        destino,
        posicion.x,
        posicion.y,
        agregar
      );
    });

    const cerrar = agregar(
      this.add.rectangle(
        1160, 72, 72, 60, 0xa42d2d
      )
        .setDepth(620)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true })
    );

    agregar(
      this.add.text(1160, 72, 'X', {
        fontFamily: 'Arial',
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
        .setOrigin(0.5)
        .setDepth(621)
    );

    cerrar.on('pointerdown', (p, x, y, e) => {
      e.stopPropagation();
      this.cerrarMapa();
    });
  }

  crearTarjetaMapa(destino, x, y, agregar) {
    const bloqueado =
      destino.id === 'sakura' &&
      !partida.sakuraDesbloqueado;

    const actual = destino.id === this.ubicacionActual;

    const marco = agregar(
      this.add.rectangle(
        x, y, 455, 210,
        bloqueado ? 0x696969 : 0xf3eee0
      )
        .setDepth(603)
        .setStrokeStyle(
          5,
          actual ? 0x2c9c42 : 0x242424
        )
        .setInteractive({ useHandCursor: true })
    );

    const imagen = agregar(
      this.add.image(
        x, y - 20, destino.textura
      )
        .setDisplaySize(420, 135)
        .setDepth(604)
        .setInteractive({ useHandCursor: true })
    );

    if (bloqueado) {
      agregar(
        this.add.rectangle(
          x, y - 20, 420, 135,
          0x000000, 0.68
        ).setDepth(606)
      );

      agregar(
        this.add.text(x, y - 20, '🔒', {
          fontFamily: 'Arial',
          fontSize: '56px'
        })
          .setOrigin(0.5)
          .setDepth(607)
      );
    }

    agregar(
      this.add.text(
        x, y + 77, destino.nombre,
        {
          fontFamily: 'Arial',
          fontSize: '24px',
          fontStyle: 'bold',
          color: bloqueado
            ? '#dddddd'
            : '#222222'
        }
      )
        .setOrigin(0.5)
        .setDepth(608)
    );

    const viajar = (p, a, b, event) => {
      event.stopPropagation();

      if (bloqueado) {
        this.mostrarMensajeMapa(
          'Sakura está bloqueado.\nCompletá el desafío de Fran.'
        );
        return;
      }

      this.viajarA(destino.id);
    };

    marco.on('pointerdown', viajar);
    imagen.on('pointerdown', viajar);
  }

  mostrarMensajeMapa(mensaje) {
    if (this.mensajeMapa?.active) {
      this.mensajeMapa.destroy();
    }

    this.mensajeMapa = this.add.text(
      640, 360, mensaje,
      {
        fontFamily: 'Arial',
        fontSize: '27px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#252525',
        align: 'center',
        padding: { x: 24, y: 18 }
      }
    )
      .setOrigin(0.5)
      .setDepth(650);

    const texto = this.mensajeMapa;

    this.time.delayedCall(1800, () => {
      if (texto.active) texto.destroy();
    });
  }

  cerrarMapa() {
    if (!this.mapaAbierto) return;

    this.mapaAbierto = false;

    for (const elemento of this.elementosMapa) {
      if (elemento?.active) elemento.destroy();
    }

    this.elementosMapa = [];

    if (this.mensajeMapa?.active) {
      this.mensajeMapa.destroy();
    }

    this.mensajeMapa = null;
  }

  guardarPosicionActual() {
    partida.posiciones[this.ubicacionActual] = {
      x: this.jugador.x,
      y: this.jugador.y
    };
  }

  viajarA(destino) {
    if (
      destino === 'sakura' &&
      !partida.sakuraDesbloqueado
    ) return;

    this.guardarPosicionActual();
    this.cerrarMapa();
    this.deseleccionarObjeto();
    this.detenerJugador();
    this.accionPendiente = null;
    this.mostrarUbicacion(destino);
  }

  completarDesafioFran() {
    partida.desafioFranCompletado = true;
    partida.sakuraDesbloqueado = true;
  }

  // =====================================================
  // FRAN: NPC SÓLIDO + DIÁLOGOS
  // =====================================================

  crearFran() {
    // Se ubica frente al televisor. Los pies están en y=570.
    this.franNPC = this.add.image(787, 570, 'franNormal')
      .setOrigin(0.5, 1)
      .setDisplaySize(190, 285)
      .setDepth(9)
      .setVisible(false);

    this.franNPC.on('pointerdown', (pointer, lx, ly, event) => {
      event.stopPropagation();
      if (this.ubicacionActual !== 'fran' ||
          this.mapaAbierto || this.vistaCajonAbierta || this.dialogoActivo) return;

      // Dos puntos de acercamiento fuera del cuerpo sólido.
      const candidatos = [
        { x: 710, y: 590 },
        { x: 860, y: 590 },
        { x: 710, y: 610 },
        { x: 870, y: 610 }
      ].filter(p => this.puntoValido(p));
      const inicio = { x: this.jugador.x, y: this.jugador.y };
      const opciones = candidatos
        .map(p => ({ p, ruta: this.buscarRuta(inicio, p) }))
        .filter(o => o.ruta.length || Phaser.Math.Distance.Between(inicio.x, inicio.y, o.p.x, o.p.y) < 2)
        .sort((a, b) => {
          const longitud = o => {
            let total = 0, anterior = inicio;
            for (const punto of o.ruta) {
              total += Phaser.Math.Distance.Between(anterior.x, anterior.y, punto.x, punto.y);
              anterior = punto;
            }
            return total;
          };
          return longitud(a) - longitud(b);
        });
      if (!opciones.length) {
        this.mostrarMensaje('No puedo acercarme a Fran desde acá.');
        return;
      }
      const objeto = this.objetoSeleccionado?.nombre;
      this.irHasta(opciones[0].p, () => {
        if (objeto === 'monster' || objeto === 'pinzas') this.entregarObjetoFran(objeto);
        else this.iniciarDialogoFran();
      });
    });
  }

  crearTexturasPruebaFran() {
    // Iconos provisionales para probar la mecánica sin depender de PNG nuevos.
    for (const [clave, color, etiqueta] of [
      ['monster', 0x42b54b, 'M'], ['pinzas', 0xc0c5ce, 'P']
    ]) {
      if (this.textures.exists(clave)) continue;
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(color).fillRoundedRect(4, 4, 56, 56, 8);
      g.lineStyle(3, 0x202020).strokeRoundedRect(4, 4, 56, 56, 8);
      g.generateTexture(clave, 64, 64);
      g.destroy();
    }
  }

  darObjetoPruebaFran(nombre) {
    if (this.dialogoActivo || this.mapaAbierto || this.vistaCajonAbierta) return;
    if (nombre === 'monster' && partida.franMonsterEntregada) return;
    if (nombre === 'pinzas' && partida.franPinzasEntregadas) return;
    if (this.inventario.includes(nombre)) return;
    if (this.agregarAlInventario(nombre, nombre)) {
      this.mostrarMensaje(`Objeto de prueba: ${nombre}. Seleccionalo y dáselo a Fran.`);
    }
  }

  entregarObjetoFran(nombre) {
    if (!this.inventario.includes(nombre)) return this.iniciarDialogoFran();
    if (nombre === 'monster' && partida.franMonsterEntregada) return this.iniciarDialogoFran();
    if (nombre === 'pinzas' && partida.franPinzasEntregadas) return this.iniciarDialogoFran();
    this.quitarObjetoNormal(nombre);
    if (nombre === 'monster') partida.franMonsterEntregada = true;
    if (nombre === 'pinzas') partida.franPinzasEntregadas = true;
    this.franHablado = true;
    this.iniciarDialogoFran();
  }

  iniciarDialogoFran() {
    if (this.dialogoActivo) return;
    this.detenerJugador();
    this.accionPendiente = null;
    this.deseleccionarObjeto();
    this.dialogoActivo = true;
    this.dialogoIndice = 0;
    const tieneMonster = partida.franMonsterEntregada;
    const tienePinzas = partida.franPinzasEntregadas;
    if (tieneMonster && tienePinzas) {
      this.dialogoLineas = [
        { nombre: 'Fran', texto: 'Tengo todo. Ahora sí, vamos a fabricar el Penjamin.', expresion: 'franCientifico' },
        { nombre: 'Fran', texto: 'El minijuego de fabricación es nuestro próximo paso.', expresion: 'franNormal' }
      ];
    } else if (tieneMonster || tienePinzas) {
      this.dialogoLineas = [
        { nombre: 'Fran', texto: tieneMonster ? 'La Monster ya la tengo. Me faltan las pinzas.' : 'Las pinzas ya están. Ahora traeme una Monster.', expresion: 'franPensando' }
      ];
    } else if (this.franHablado) {
      this.dialogoLineas = [
        { nombre: 'Fran', texto: '¿Conseguiste la Monster y las pinzas?', expresion: 'franPensando' },
        { nombre: 'Fran', texto: 'Seleccioná el objeto en el inventario y hacé clic sobre mí.', expresion: 'franNormal' }
      ];
    } else {
      this.dialogoLineas = [
        { nombre: 'Fran', texto: '¿Otra vez vos? ¿Qué necesitás ahora?', expresion: 'franNormal' },
        { nombre: 'Protagonista', texto: 'Necesito que me ayudes con un invento.', expresion: 'normal' },
        { nombre: 'Fran', texto: 'Depende. ¿Es una boludez?', expresion: 'franBurlon' },
        { nombre: 'Protagonista', texto: 'Bastante.', expresion: 'normal' },
        { nombre: 'Fran', texto: 'Bueno, entonces me interesa. Traeme una Monster y unas pinzas.', expresion: 'franPensando' }
      ];
    }
    this.franHablado = true;

    const guardar = obj => { this.dialogoElementos.push(obj); return obj; };
    this.dialogoElementos = [];
    const fondo = guardar(this.add.rectangle(640, 544, 1110, 178, 0x1c2230, 0.97)
      .setStrokeStyle(3, 0xd1ad52).setDepth(400).setInteractive());
    fondo.on('pointerdown', (p, x, y, event) => {
      event.stopPropagation();
      this.avanzarDialogo();
    });
    guardar(this.add.rectangle(185, 543, 135, 146, 0x394255)
      .setDepth(401).setStrokeStyle(2, 0x778092));
    this.dialogoRetrato = guardar(this.add.image(185, 543, 'franNormal')
      .setDepth(402));
    this.dialogoNombre = guardar(this.add.text(285, 473, '', {
      fontFamily: 'Arial', fontSize: '29px', fontStyle: 'bold', color: '#ffce53'
    }).setDepth(403));
    this.dialogoTexto = guardar(this.add.text(285, 515, '', {
      fontFamily: 'Arial', fontSize: '25px', color: '#ffffff',
      wordWrap: { width: 835 }, lineSpacing: 5
    }).setDepth(403));
    guardar(this.add.text(1145, 606, 'Clic para continuar ▸', {
      fontFamily: 'Arial', fontSize: '17px', color: '#b8c1d2'
    }).setOrigin(1, 0.5).setDepth(403));
    this.mostrarLineaDialogo();
  }

  mostrarLineaDialogo() {
    const linea = this.dialogoLineas[this.dialogoIndice];
    if (!linea) return this.cerrarDialogo();
    this.dialogoNombre.setText(linea.nombre);
    this.dialogoTexto.setText(linea.texto);
    // Recorte virtual del PNG original: cara y hombros.
    const retrato = this.dialogoRetrato;
    retrato.setTexture(linea.expresion);
    const esFran = linea.expresion.startsWith('fran');
    const fuente = this.textures.get(linea.expresion).getSourceImage();
    if (esFran) {
      retrato.setCrop(260, 30, 530, 650);
      retrato.setDisplaySize(125, 153);
    } else {
      // Protagonista: recorte de la mitad superior de su PNG.
      retrato.setCrop(0, 0, fuente.width, Math.round(fuente.height * 0.48));
      retrato.setDisplaySize(125, 153);
    }
    retrato.setPosition(185, 543);
  }

  avanzarDialogo() {
    if (!this.dialogoActivo) return;
    this.dialogoIndice++;
    this.mostrarLineaDialogo();
  }

  cerrarDialogo() {
    for (const elemento of this.dialogoElementos) {
      if (elemento?.active) elemento.destroy();
    }
    this.dialogoElementos = [];
    this.dialogoActivo = false;
    this.dialogoLineas = [];
  }

  // =====================================================
  // BONG
  // =====================================================

  crearBong() {
    this.bong = this.add.image(
      555, 293, 'bong'
    )
      .setOrigin(0.5, 1)
      .setDisplaySize(65, 65)
      .setDepth(1)
      .setInteractive({ useHandCursor: true });

    if (this.inventarioEspecial.includes('bong')) {
      this.bong.destroy();
      return;
    }

    this.bong.on(
      'pointerdown',
      (pointer, x, y, event) => {
        event.stopPropagation();

        if (
          this.mapaAbierto ||
          this.vistaCajonAbierta ||
          this.ubicacionActual !== 'pedro'
        ) return;

        this.irHasta(
          { x: 390, y: 580 },
          () => this.recogerBong()
        );
      }
    );
  }

  recogerBong() {
    if (this.inventarioEspecial.includes('bong')) {
      return;
    }

    const icono = this.agregarObjetoEspecial(
      'bong', 'bong'
    );

    if (!icono) return;

    this.bong.destroy();
    this.mostrarMensaje(
      '¡Conseguiste el bong rosa!'
    );
  }

  // =====================================================
  // CAJÓN DEL ESCRITORIO
  // =====================================================

  crearZonaEscritorio() {
    this.zonaEscritorio = this.add.zone(
      885, 458, 390, 115
    )
      .setDepth(20)
      .setInteractive({ useHandCursor: true });

    this.zonaEscritorio.on(
      'pointerdown',
      (pointer, x, y, event) => {
        event.stopPropagation();

        if (
          this.mapaAbierto ||
          this.vistaCajonAbierta ||
          this.ubicacionActual !== 'pedro'
        ) return;

        this.irHasta(
          { x: 770, y: 580 },
          () => this.abrirVistaCajon()
        );
      }
    );
  }

  abrirVistaCajon() {
    if (this.vistaCajonAbierta) return;

    this.vistaCajonAbierta = true;
    this.detenerJugador();
    this.accionPendiente = null;
    this.elementosVistaCajon = [];

    const agregar = objeto => {
      this.elementosVistaCajon.push(objeto);
      return objeto;
    };

    const fondo = agregar(
      this.add.rectangle(
        640, 360, 1280, 720,
        0x000000, 0.88
      )
        .setDepth(300)
        .setInteractive()
    );

    fondo.on('pointerdown', (p, x, y, e) => {
      e.stopPropagation();
    });

    agregar(
      this.add.rectangle(
        640, 355, 1000, 625,
        0x171717
      )
        .setDepth(301)
        .setStrokeStyle(5, 0x555555)
    );

    this.imagenCajon = agregar(
      this.add.image(
        640, 355,
        this.cajonAbierto
          ? 'cajonAbierto'
          : 'cajonCerrado'
      ).setDepth(302)
    );

    this.ajustarImagenCajon();

    const cerrar = agregar(
      this.add.rectangle(
        1100, 72, 65, 55, 0x9c2020
      )
        .setDepth(310)
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true })
    );

    agregar(
      this.add.text(1100, 72, 'X', {
        fontFamily: 'Arial',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
        .setOrigin(0.5)
        .setDepth(311)
    );

    cerrar.on('pointerdown', (p, x, y, e) => {
      e.stopPropagation();
      this.cerrarVistaCajon();
    });

    const mensaje = this.cajonAbierto
      ? (
          this.joystickRecogido
            ? 'El cajón está vacío'
            : 'Último cajón abierto'
        )
      : 'El último cajón está cerrado con llave';

    this.textoIndicacionCajon = agregar(
      this.add.text(
        640, 65, mensaje,
        {
          fontFamily: 'Arial',
          fontSize: '25px',
          color: '#ffffff',
          backgroundColor: '#222222',
          padding: { x: 16, y: 9 }
        }
      )
        .setOrigin(0.5)
        .setDepth(309)
    );

    this.crearInventarioTemporalCajon();
    this.actualizarInteraccionCajon();
  }

  ajustarImagenCajon() {
    const textura = this.cajonAbierto
      ? 'cajonAbierto'
      : 'cajonCerrado';

    const fuente = this.textures
      .get(textura)
      .getSourceImage();

    const escala = Math.min(
      900 / fuente.width,
      530 / fuente.height
    );

    this.imagenCajon.setDisplaySize(
      fuente.width * escala,
      fuente.height * escala
    );
  }

  crearInventarioTemporalCajon() {
    this.iconosTemporalesCajon = [];

    if (
      !this.inventario.includes('llave') ||
      this.cajonAbierto
    ) return;

    const fondo = this.add.rectangle(
      640, 650, 90, 74, 0x222222
    )
      .setDepth(320)
      .setStrokeStyle(3, 0x315a32);

    const icono = this.add.image(
      640, 650, 'llave'
    )
      .setDisplaySize(55, 55)
      .setDepth(321)
      .setInteractive({ useHandCursor: true });

    icono.on('pointerdown', (p, x, y, event) => {
      event.stopPropagation();

      if (
        this.objetoSeleccionado?.nombre === 'llave'
      ) {
        this.deseleccionarObjeto();

        this.textoIndicacionCajon.setText(
          'El último cajón está cerrado con llave'
        );
      } else {
        this.seleccionarObjeto(
          'llave',
          'llave',
          { x: 640, y: 650 },
          'normal'
        );

        this.textoIndicacionCajon.setText(
          'Ahora usá la llave en el último cajón'
        );
      }
    });

    this.iconosTemporalesCajon.push(
      fondo, icono
    );

    this.elementosVistaCajon.push(
      fondo, icono
    );
  }

  actualizarInteraccionCajon() {
    if (this.zonaUltimoCajon?.active) {
      this.zonaUltimoCajon.destroy();
    }

    if (this.joystickEnCajon?.active) {
      this.joystickEnCajon.destroy();
    }

    this.zonaUltimoCajon = null;
    this.joystickEnCajon = null;

    const ancho = this.imagenCajon.displayWidth;
    const alto = this.imagenCajon.displayHeight;

    const izquierda =
      this.imagenCajon.x - ancho / 2;

    const arriba =
      this.imagenCajon.y - alto / 2;

    if (!this.cajonAbierto) {
      this.zonaUltimoCajon = this.add.zone(
        izquierda + ancho * 0.49,
        arriba + alto * 0.75,
        ancho * 0.46,
        alto * 0.18
      )
        .setDepth(305)
        .setInteractive({ useHandCursor: true });

      this.zonaUltimoCajon.on(
        'pointerdown',
        (p, x, y, event) => {
          event.stopPropagation();
          this.abrirUltimoCajon();
        }
      );

      this.elementosVistaCajon.push(
        this.zonaUltimoCajon
      );

    } else if (!this.joystickRecogido) {
      this.joystickEnCajon = this.add.image(
        izquierda + ancho * 0.49,
        arriba + alto * 0.67 - 20,
        'joystick'
      )
        .setDisplaySize(
          Math.min(90, ancho * 0.20),
          Math.min(68, alto * 0.15)
        )
        .setDepth(306)
        .setInteractive({ useHandCursor: true });

      this.joystickEnCajon.on(
        'pointerdown',
        (p, x, y, event) => {
          event.stopPropagation();
          this.recogerJoystick();
        }
      );

      this.elementosVistaCajon.push(
        this.joystickEnCajon
      );
    }
  }

  abrirUltimoCajon() {
    if (this.cajonAbierto) return;

    if (
      !this.inventario.includes('llave') ||
      this.objetoSeleccionado?.nombre !== 'llave'
    ) {
      this.textoIndicacionCajon.setText(
        'Está cerrado con llave. Necesito encontrarla.'
      );
      return;
    }

    this.quitarObjetoNormal('llave');

    for (const objeto of this.iconosTemporalesCajon) {
      if (objeto.active) objeto.destroy();
    }

    this.iconosTemporalesCajon = [];

    this.cajonAbierto = true;
    partida.cajonAbierto = true;

    this.imagenCajon.setTexture('cajonAbierto');
    this.ajustarImagenCajon();

    this.textoIndicacionCajon.setText(
      '¡Abriste el cajón! Encontraste un joystick.'
    );

    this.actualizarInteraccionCajon();
  }

  recogerJoystick() {
    if (this.joystickRecogido) return;

    const icono = this.agregarObjetoEspecial(
      'joystick', 'joystick'
    );

    if (!icono) return;

    this.joystickRecogido = true;
    partida.joystickRecogido = true;

    if (this.joystickEnCajon?.active) {
      this.joystickEnCajon.destroy();
    }

    this.joystickEnCajon = null;

    this.textoIndicacionCajon.setText(
      '¡Conseguiste el joystick de Xbox!'
    );
  }

  cerrarVistaCajon() {
    if (!this.vistaCajonAbierta) return;

    this.vistaCajonAbierta = false;
    this.deseleccionarObjeto();

    for (const elemento of this.elementosVistaCajon) {
      if (elemento?.active) elemento.destroy();
    }

    this.elementosVistaCajon = [];
    this.zonaUltimoCajon = null;
    this.joystickEnCajon = null;
    this.imagenCajon = null;
    this.textoIndicacionCajon = null;
  }

  // =====================================================
  // INVENTARIO NORMAL
  // =====================================================

  crearInventario() {
    this.barraInventario = this.add.rectangle(
      640, 679, 1280, 82, 0x080808
    )
      .setDepth(100)
      .setInteractive();

    this.barraInventario.on(
      'pointerdown',
      (p, x, y, event) => {
        event.stopPropagation();
      }
    );

    this.dibujarEnredadera();

    const cantidad = 6;
    const ancho = 70;
    const separacion = 13;

    const anchoTotal =
      cantidad * ancho +
      (cantidad - 1) * separacion;

    const inicioX =
      640 - anchoTotal / 2 + ancho / 2;

    for (let i = 0; i < cantidad; i++) {
      const x = inicioX + i * (ancho + separacion);
      const y = 683;

      const borde = this.add.rectangle(
        x, y, 74, 66, 0x315a32
      ).setDepth(102);

      const casilla = this.add.rectangle(
        x, y, 68, 60, 0xffffff
      )
        .setDepth(103)
        .setInteractive();

      casilla.on(
        'pointerdown',
        (p, a, b, event) => {
          event.stopPropagation();
        }
      );

      this.casillasInventario.push({
        x, y, borde, casilla
      });
    }
  }

  dibujarEnredadera() {
    const g = this.add.graphics().setDepth(101);

    g.lineStyle(2.5, 0x235c29, 1);
    g.beginPath();

    for (let x = 0; x <= 1280; x += 4) {
      const y =
        638 + Math.sin(x * 0.019) * 1.8;

      if (x === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
    }

    g.strokePath();

    for (let i = 0; i < 26; i++) {
      const x = 24 + i * 49;
      const y =
        638 + Math.sin(x * 0.019) * 1.8;

      const inclinacion =
        i % 2 === 0 ? -0.17 : 0.17;

      const escala =
        i % 4 === 0 ? 0.39 : 0.33;

      this.dibujarChala(
        g, x, y, escala, inclinacion, i
      );
    }
  }

  dibujarChala(g, x, y, escala, rotacion, indice) {
    const verde = indice % 3 === 0
      ? 0x25a629
      : 0x168a20;

    const transformar = (px, py) => ({
      x: x + (
        px * Math.cos(rotacion) -
        py * Math.sin(rotacion)
      ) * escala,

      y: y + (
        px * Math.sin(rotacion) +
        py * Math.cos(rotacion)
      ) * escala
    });

    const foliolos = [
      [-1.12, 23, 4],
      [-0.77, 32, 5],
      [-0.38, 39, 5.5],
      [0, 46, 6],
      [0.38, 39, 5.5],
      [0.77, 32, 5],
      [1.12, 23, 4]
    ];

    for (const [angulo, largo, anchoBase] of foliolos) {
      const dx = Math.sin(angulo);
      const dy = -Math.cos(angulo);
      const px = -dy;
      const py = dx;

      const puntos = [{ x: 0, y: 0 }];

      for (let k = 1; k <= 5; k++) {
        const t = k / 6;
        const ancho =
          Math.sin(Math.PI * t) * anchoBase;

        puntos.push({
          x: dx * largo * t + px * ancho,
          y: dy * largo * t + py * ancho
        });
      }

      puntos.push({
        x: dx * largo,
        y: dy * largo
      });

      for (let k = 5; k >= 1; k--) {
        const t = k / 6;
        const ancho =
          Math.sin(Math.PI * t) * anchoBase;

        puntos.push({
          x: dx * largo * t - px * ancho,
          y: dy * largo * t - py * ancho
        });
      }

      const inicio = transformar(
        puntos[0].x, puntos[0].y
      );

      g.fillStyle(verde, 1);
      g.lineStyle(
        2.7 * escala,
        0x0b170c,
        1
      );

      g.beginPath();
      g.moveTo(inicio.x, inicio.y);

      for (let k = 1; k < puntos.length; k++) {
        const p = transformar(
          puntos[k].x, puntos[k].y
        );
        g.lineTo(p.x, p.y);
      }

      g.closePath();
      g.fillPath();
      g.strokePath();

      const punta = transformar(
        dx * largo * 0.88,
        dy * largo * 0.88
      );

      g.lineStyle(
        Math.max(0.5, escala * 1.6),
        0x53d33e,
        0.95
      );

      g.beginPath();
      g.moveTo(inicio.x, inicio.y);
      g.lineTo(punta.x, punta.y);
      g.strokePath();
    }
  }

  // =====================================================
  // INVENTARIO ESPECIAL
  // =====================================================

  crearInventarioEspecial() {
    const x = 48;
    const centroY = 320;

    this.panelEspecial = this.add.rectangle(
      x, centroY, 88, 410, 0x11100c
    )
      .setDepth(110)
      .setStrokeStyle(4, 0xb8862d)
      .setInteractive();

    this.panelEspecial.on(
      'pointerdown',
      (p, a, b, event) => {
        event.stopPropagation();
      }
    );

    this.add.rectangle(
      x, centroY, 78, 400
    )
      .setDepth(111)
      .setStrokeStyle(1.5, 0xf1d07b);

    const decoracion = this.add.graphics()
      .setDepth(112);

    decoracion.lineStyle(2, 0xd8a843, 1);
    decoracion.beginPath();

    decoracion.moveTo(14, 135);
    decoracion.lineTo(14, 124);
    decoracion.lineTo(26, 124);

    decoracion.moveTo(82, 135);
    decoracion.lineTo(82, 124);
    decoracion.lineTo(70, 124);

    decoracion.moveTo(14, 505);
    decoracion.lineTo(14, 516);
    decoracion.lineTo(26, 516);

    decoracion.moveTo(82, 505);
    decoracion.lineTo(82, 516);
    decoracion.lineTo(70, 516);

    decoracion.strokePath();

    decoracion.fillStyle(0xf1cf75, 1);

    decoracion.fillPoints([
      { x: 48, y: 149 },
      { x: 53, y: 154 },
      { x: 48, y: 159 },
      { x: 43, y: 154 }
    ], true);

    decoracion.fillPoints([
      { x: 48, y: 485 },
      { x: 53, y: 490 },
      { x: 48, y: 495 },
      { x: 43, y: 490 }
    ], true);

    for (let i = 0; i < 5; i++) {
      const y = 191 + i * 72;

      const borde = this.add.rectangle(
        x, y, 67, 65, 0xb8862d
      )
        .setDepth(113)
        .setStrokeStyle(2, 0xf5d782);

      const casilla = this.add.rectangle(
        x, y, 57, 55, 0xfff9e8
      )
        .setDepth(114)
        .setInteractive();

      casilla.on(
        'pointerdown',
        (p, a, b, event) => {
          event.stopPropagation();
        }
      );

      this.casillasEspeciales.push({
        x, y, borde, casilla
      });
    }
  }

  // =====================================================
  // OBJETOS E INVENTARIOS
  // =====================================================

  agregarAlInventario(
    nombre,
    textura,
    restaurando = false
  ) {
    if (
      this.inventario.includes(nombre) &&
      !restaurando
    ) return null;

    if (
      this.inventario.length >= 6 &&
      !restaurando
    ) return null;

    if (!this.textures.exists(textura)) {
      return null;
    }

    const indice = restaurando
      ? this.inventario.indexOf(nombre)
      : this.inventario.length;

    const casilla = this.casillasInventario[indice];
    if (!casilla) return null;

    const icono = this.add.image(
      casilla.x, casilla.y, textura
    )
      .setDisplaySize(48, 48)
      .setDepth(104)
      .setData('casilla', casilla)
      .setInteractive({ useHandCursor: true });

    icono.on(
      'pointerdown',
      (p, x, y, event) => {
        event.stopPropagation();

        if (
          this.vistaCajonAbierta ||
          this.mapaAbierto
        ) return;

        this.seleccionarObjeto(
          nombre,
          textura,
          icono.getData('casilla'),
          'normal'
        );
      }
    );

    this.iconosNormales[nombre] = icono;

    if (!restaurando) {
      this.inventario.push(nombre);
    }

    return icono;
  }

  agregarObjetoEspecial(
    nombre,
    textura,
    restaurando = false
  ) {
    if (
      this.inventarioEspecial.includes(nombre) &&
      !restaurando
    ) return null;

    if (
      this.inventarioEspecial.length >= 5 &&
      !restaurando
    ) return null;

    if (!this.textures.exists(textura)) {
      return null;
    }

    const indice = restaurando
      ? this.inventarioEspecial.indexOf(nombre)
      : this.inventarioEspecial.length;

    const casilla = this.casillasEspeciales[indice];
    if (!casilla) return null;

    const icono = this.add.image(
      casilla.x, casilla.y, textura
    )
      .setDisplaySize(45, 45)
      .setDepth(115)
      .setInteractive({ useHandCursor: true });

    icono.on(
      'pointerdown',
      (p, x, y, event) => {
        event.stopPropagation();

        if (
          this.vistaCajonAbierta ||
          this.mapaAbierto
        ) return;

        this.seleccionarObjeto(
          nombre,
          textura,
          casilla,
          'especial'
        );
      }
    );

    this.iconosEspeciales[nombre] = icono;

    if (!restaurando) {
      this.inventarioEspecial.push(nombre);
    }

    return icono;
  }

  restaurarInventarios() {
    for (const nombre of this.inventario) {
      this.agregarAlInventario(
        nombre, nombre, true
      );
    }

    for (const nombre of this.inventarioEspecial) {
      this.agregarObjetoEspecial(
        nombre, nombre, true
      );
    }
  }

  quitarObjetoNormal(nombre) {
    const indice = this.inventario.indexOf(nombre);
    if (indice === -1) return;

    this.deseleccionarObjeto();

    const icono = this.iconosNormales[nombre];

    if (icono) {
      icono.destroy();
      delete this.iconosNormales[nombre];
    }

    this.inventario.splice(indice, 1);

    this.inventario.forEach((objeto, i) => {
      const restante = this.iconosNormales[objeto];
      const casilla = this.casillasInventario[i];

      if (restante) {
        restante.setPosition(
          casilla.x, casilla.y
        );

        restante.setData('casilla', casilla);
      }
    });
  }

  seleccionarObjeto(
    nombre,
    textura,
    casilla,
    tipo
  ) {
    if (
      this.objetoSeleccionado?.nombre === nombre &&
      this.objetoSeleccionado?.tipo === tipo
    ) {
      this.deseleccionarObjeto();
      return;
    }

    if (this.objetoCursor) {
      this.objetoCursor.destroy();
    }

    this.objetoSeleccionado = {
      nombre,
      textura,
      casilla,
      tipo
    };

    const pointer = this.input.activePointer;

    this.objetoCursor = this.add.image(
      pointer.worldX + 18,
      pointer.worldY + 18,
      textura
    )
      .setDisplaySize(52, 52)
      .setAlpha(0.55)
      .setDepth(500);

    this.haloSeleccion.setVisible(true);
    this.tiempoHalo = 0;
    this.dibujarHalo();
  }

  deseleccionarObjeto() {
    this.objetoSeleccionado = null;

    if (this.objetoCursor) {
      this.objetoCursor.destroy();
      this.objetoCursor = null;
    }

    this.haloSeleccion.clear();
    this.haloSeleccion.setVisible(false);
  }

  dibujarHalo() {
    this.haloSeleccion.clear();

    if (!this.objetoSeleccionado) return;

    const { x, y } =
      this.objetoSeleccionado.casilla;

    const especial =
      this.objetoSeleccionado.tipo === 'especial';

    const ancho = especial ? 67 : 74;
    const alto = especial ? 65 : 66;

    const pulso = (
      Math.sin(this.tiempoHalo * 0.005) + 1
    ) / 2;

    const g = this.haloSeleccion;

    g.setDepth(
      especial ? 114.5 : 103.5
    );

    g.lineStyle(
      13, 0x00ff55,
      0.10 + pulso * 0.08
    );

    g.strokeRoundedRect(
      x - ancho / 2 - 3,
      y - alto / 2 - 3,
      ancho + 6,
      alto + 6,
      7
    );

    g.lineStyle(
      8, 0x00ff44,
      0.22 + pulso * 0.12
    );

    g.strokeRoundedRect(
      x - ancho / 2 - 2,
      y - alto / 2 - 2,
      ancho + 4,
      alto + 4,
      6
    );

    g.lineStyle(
      3.5, 0x39ff14,
      0.85 + pulso * 0.15
    );

    g.strokeRoundedRect(
      x - ancho / 2,
      y - alto / 2,
      ancho,
      alto,
      4
    );

    g.lineStyle(
      1.5, 0xbaffc5,
      0.65 + pulso * 0.25
    );

    g.strokeRoundedRect(
      x - ancho / 2 + 4,
      y - alto / 2 + 4,
      ancho - 8,
      alto - 8,
      3
    );
  }

  // =====================================================
  // MOVIMIENTO Y COLISIONES
  // =====================================================

  puntoValido(punto) {
    const l = this.limites;

    if (
      punto.x < l.izquierda ||
      punto.x > l.derecha ||
      punto.y < l.arriba ||
      punto.y > l.abajo
    ) return false;

    for (const o of this.obstaculos) {
      if (
        punto.x >= o.izquierda &&
        punto.x <= o.derecha &&
        punto.y >= o.arriba &&
        punto.y <= o.abajo
      ) return false;
    }

    return true;
  }

  tramoLibre(a, b) {
    const distancia =
      Phaser.Math.Distance.Between(
        a.x, a.y, b.x, b.y
      );

    const pasos = Math.max(
      1,
      Math.ceil(distancia / 4)
    );

    for (let i = 0; i <= pasos; i++) {
      const t = i / pasos;

      const punto = {
        x: Phaser.Math.Linear(a.x, b.x, t),
        y: Phaser.Math.Linear(a.y, b.y, t)
      };

      if (!this.puntoValido(punto)) {
        return false;
      }
    }

    return true;
  }

  buscarRuta(inicio, destino) {
    if (!this.puntoValido(destino)) {
      return [];
    }

    if (this.tramoLibre(inicio, destino)) {
      return [destino];
    }

    const puntos = [inicio, destino];

    for (const o of this.obstaculos) {
      const margen = 15;

      const esquinas = [
        {
          x: o.izquierda - margen,
          y: o.arriba - margen
        },
        {
          x: o.derecha + margen,
          y: o.arriba - margen
        },
        {
          x: o.izquierda - margen,
          y: o.abajo + margen
        },
        {
          x: o.derecha + margen,
          y: o.abajo + margen
        }
      ];

      for (const esquina of esquinas) {
        if (this.puntoValido(esquina)) {
          puntos.push(esquina);
        }
      }
    }

    const distancias = Array(
      puntos.length
    ).fill(Infinity);

    const anteriores = Array(
      puntos.length
    ).fill(-1);

    const visitados = new Set();
    distancias[0] = 0;

    // Algoritmo Dijkstra
    for (
      let paso = 0;
      paso < puntos.length;
      paso++
    ) {
      let actual = -1;

      for (let i = 0; i < puntos.length; i++) {
        if (
          !visitados.has(i) &&
          (
            actual === -1 ||
            distancias[i] < distancias[actual]
          )
        ) {
          actual = i;
        }
      }

      if (
        actual === -1 ||
        distancias[actual] === Infinity
      ) break;

      if (actual === 1) break;

      visitados.add(actual);

      for (let i = 0; i < puntos.length; i++) {
        if (
          i === actual ||
          visitados.has(i) ||
          !this.tramoLibre(
            puntos[actual],
            puntos[i]
          )
        ) continue;

        const distancia =
          Phaser.Math.Distance.Between(
            puntos[actual].x,
            puntos[actual].y,
            puntos[i].x,
            puntos[i].y
          );

        const nueva =
          distancias[actual] + distancia;

        if (nueva < distancias[i]) {
          distancias[i] = nueva;
          anteriores[i] = actual;
        }
      }
    }

    if (distancias[1] === Infinity) {
      return [];
    }

    const ruta = [];
    let indice = 1;

    while (
      indice !== 0 &&
      indice !== -1
    ) {
      ruta.unshift(puntos[indice]);
      indice = anteriores[indice];
    }

    return ruta;
  }

  irHasta(destino, accion) {
    const inicio = {
      x: this.jugador.x,
      y: this.jugador.y
    };

    const destinoSeguro =
      this.puntoValido(destino)
        ? destino
        : this.buscarPosicionSegura(
            destino.x,
            destino.y
          );

    this.ruta = this.buscarRuta(
      inicio,
      destinoSeguro
    );

    if (this.ruta.length) {
      this.accionPendiente = accion;
      this.jugador.play('caminar', true);

    } else if (
      Phaser.Math.Distance.Between(
        inicio.x,
        inicio.y,
        destinoSeguro.x,
        destinoSeguro.y
      ) < 2
    ) {
      this.detenerJugador();
      accion();

    } else {
      this.accionPendiente = null;
    }
  }

  detenerJugador() {
    this.ruta = [];
    this.jugador.stop();
    this.jugador.setTexture('normal');
  }

  // =====================================================
  // MENSAJES
  // =====================================================

  mostrarMensaje(texto) {
    const mensaje = this.add.text(
      640, 105, texto,
      {
        fontFamily: 'Arial',
        fontSize: '27px',
        color: '#ffffff',
        backgroundColor: '#222222',
        padding: { x: 18, y: 12 }
      }
    )
      .setOrigin(0.5)
      .setDepth(250);

    this.time.delayedCall(2000, () => {
      if (mensaje.active) {
        mensaje.destroy();
      }
    });
  }

  // =====================================================
  // ACTUALIZACIÓN
  // =====================================================

  update(time, delta) {
    if (this.objetoSeleccionado) {
      this.tiempoHalo += delta;
      this.dibujarHalo();
    }

    if (this.objetoCursor) {
      const pointer = this.input.activePointer;

      this.objetoCursor.setPosition(
        pointer.worldX + 18,
        pointer.worldY + 18
      );
    }

    if (
      this.mapaAbierto ||
      this.vistaCajonAbierta || this.dialogoActivo
    ) return;

    if (!this.ruta.length) return;

    let restante =
      this.velocidad * delta / 1000;

    while (
      restante > 0 &&
      this.ruta.length
    ) {
      const destino = this.ruta[0];

      const dx =
        destino.x - this.jugador.x;

      const dy =
        destino.y - this.jugador.y;

      const distancia = Math.hypot(dx, dy);

      if (distancia < 0.01) {
        this.ruta.shift();
        continue;
      }

      const paso = Math.min(
        restante, distancia
      );

      if (Math.abs(dx) > 1) {
        this.jugador.setFlipX(dx < 0);
      }

      const nuevoX =
        this.jugador.x +
        dx / distancia * paso;

      const nuevoY =
        this.jugador.y +
        dy / distancia * paso;

      if (!this.puntoValido({
        x: nuevoX,
        y: nuevoY
      })) {
        this.detenerJugador();
        this.accionPendiente = null;
        return;
      }

      this.jugador.setPosition(
        nuevoX, nuevoY
      );

      restante -= paso;

      if (paso >= distancia) {
        this.ruta.shift();
      }
    }

    if (!this.ruta.length) {
      this.detenerJugador();

      if (this.accionPendiente) {
        const accion = this.accionPendiente;
        this.accionPendiente = null;
        accion();
      }
    }
  }
}

// =====================================================
// INICIAR PHASER
// =====================================================

const config = {
  type: Phaser.AUTO,
  width: ANCHO,
  height: ALTO,
  parent: 'app',
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    PantallaInicio,
    EscenaCuarto
  ]
};

new Phaser.Game(config);
