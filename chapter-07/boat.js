class Boat {
  constructor(allParameters) {
    this.allParameters = allParameters
  }

  toString() {
    console.log(`Boat info is: `)
    console.table(this.allParameters)
  }
}

export class BoatBuilder {
  withMotors(count, brand, model) {
    this.hasMotor = true
    this.motorCount = count
    this.motorBrand = brand
    this.motorModel = model

    return this
  }

  withSails(count, material, color) {
    this.hasSails = true
    this.sailsCount = count
    this.sailsMaterial = material
    this.sailsColor = color

    return this
  }

  hullColor(color) {
    this.hullColor = color

    return this
  }

  withCabin() {
    this.hasCabin = true

    return this
  }

  build() {
    return new Boat({
      hasMotor: this.hasMotor,
      motorCount: this.motorCount,
      motorBrand: this.motorBrand,
      motorModel: this.motorModel,
      hasSails: this.hasSails,
      sailsCount: this.sailsCount,
      sailsMaterial: this.sailsMaterial,
      sailsColor: this.sailsColor,
      hullColor: this.hullColor,
      hasCabin: this.hasCabin
    })
  }
}

const myBoat = new BoatBuilder()
  .withMotors(2, 'Best Motor Co.', 'OM123')
  .withSails(1, 'fabric', 'white')
  .withCabin()
  .hullColor('blue')
  .build()

myBoat.toString()
